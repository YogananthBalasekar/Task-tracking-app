import { useEffect, useState } from 'react';
import { Container, Row, Col, Form, Button, Modal } from 'react-bootstrap';
import { DataGrid } from '@mui/x-data-grid';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import { IconButton, TextField, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { message } from 'antd';
import { getTasks, createTask, updateTask, deleteTask } from '../api/taskApi';
import { db } from '../utils/db';
import { syncOfflineTasks } from '../utils/syncService';
import useNetworkStatus from '../services/useNetworkStatus';

export default function Dashboard() {
    const [tasks, setTasks] = useState([]);
    const [title, setTitle] = useState('');
    const [editId, setEditId] = useState(null);
    const isOnline = useNetworkStatus();
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState('add');

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);

    const [showCompleteModal, setShowCompleteModal] = useState(false);
    const [completeToggleTarget, setCompleteToggleTarget] = useState(null);

    const [filterStatus, setFilterStatus] = useState('all');
    const [searchText, setSearchText] = useState('');

    useEffect(() => {
        loadTasks().catch(err => {
            console.error('Initial load failed:', err);
            message.error('Failed to load tasks');
        });
    }, []);

    useEffect(() => {
        if (isOnline) {
            const syncAndReload = async () => {
                try {
                    console.log('Syncing offline tasks...');
                    await syncOfflineTasks();
                    message.success('Offline tasks synced successfully');
                } catch (error) {
                    console.error('Sync failed:', error);
                    message.error('Failed to sync offline tasks');
                } finally {
                    await loadTasks(); 
                }
            };
            syncAndReload();
        }
    }, [isOnline]);

    const loadTasks = async () => {
        try {
            if (isOnline) {
                const res = await getTasks();
                const serverTasks = res.data.map((t) => ({
                    ...t,
                    synced: true,
                }));
                setTasks(serverTasks);
                await db.tasks.clear();
                for (const t of serverTasks) {
                    await db.tasks.add({
                        serverId: t._id,
                        title: t.title,
                        completed: t.completed,
                        synced: true,
                    });
                }
            } else {
                const local = await db.tasks.toArray();
                setTasks(
                    local.map((t) => ({
                        _id: t.serverId || t.id,
                        title: t.title,
                        completed: t.completed,
                        synced: t.synced,
                    }))
                );
            }
        } catch (error) {
            console.error('loadTasks error:', error);
            message.error('Failed to load tasks');
            throw error; 
        }
    };

    const handleOpenAddModal = () => {
        setTitle('');
        setEditId(null);
        setModalMode('add');
        setShowModal(true);
    };

    const handleOpenEditModal = (task) => {
        setTitle(task.title);
        setEditId(task._id);
        setModalMode('edit');
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setTitle('');
        setEditId(null);
    };

    const handleModalSubmit = async (e) => {
        e.preventDefault();
        if (!title.trim()) {
            message.warning('Please enter a task title');
            return;
        }

        try {
            if (modalMode === 'edit' && editId) {
                if (isOnline) {
                    const res = await updateTask(editId, { title });
                    const task = await db.tasks.where('serverId').equals(editId).first();
                    if (task) {
                        await db.tasks.update(task.id, { title, synced: true });
                    }
                    setTasks(tasks.map((t) => (t._id === editId ? { ...res.data, synced: true } : t)));
                    message.success('Task updated successfully');
                } else {
                    await db.queue.add({
                        action: 'update',
                        data: { id: editId, body: { title } },
                    });
                    const task = await db.tasks.where('serverId').equals(editId).first();
                    if (task) {
                        await db.tasks.update(task.id, { title, synced: false });
                    } else {
                        await db.tasks.update(editId, { title, synced: false });
                    }
                    setTasks(tasks.map((t) => (t._id === editId ? { ...t, title, synced: false } : t)));
                    message.info('Task saved offline. It will sync when you are back online.');
                }
            } else {
                if (isOnline) {
                    const res = await createTask({ title });
                    await db.tasks.add({
                        serverId: res.data._id,
                        title: res.data.title,
                        completed: res.data.completed,
                        synced: true,
                    });
                    setTasks([...tasks, { ...res.data, synced: true }]);
                    message.success('Task created successfully');
                } else {
                    const id = await db.tasks.add({
                        title,
                        completed: false,
                        synced: false,
                    });
                    await db.queue.add({
                        action: 'create',
                        data: { title, id },
                    });
                    setTasks([...tasks, { _id: id, title, completed: false, synced: false }]);
                    message.info('Task saved offline. It will be added when you are back online.');
                }
            }
            handleCloseModal();
        } catch (error) {
            console.error('Submit error:', error);
            message.error('Operation failed. Please try again.');
        }
    };

    const handleDeleteClick = (id, title) => {
        setDeleteTarget({ id, title });
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!deleteTarget) return;
        const { id, title } = deleteTarget;

        try {
            if (isOnline) {
                await deleteTask(id);
                const task = await db.tasks.where('serverId').equals(id).first();
                if (task) {
                    await db.tasks.delete(task.id);
                }
                setTasks(tasks.filter((t) => t._id !== id));
                message.success(`Task "${title}" deleted`);
            } else {
                await db.queue.add({
                    action: 'delete',
                    data: { id },
                });
                const task = await db.tasks.where('serverId').equals(id).first();
                if (task) {
                    await db.tasks.delete(task.id);
                } else {
                    await db.tasks.delete(id);
                }
                setTasks(tasks.filter((t) => t._id !== id));
                message.info(`Task "${title}" will be deleted when you are back online.`);
            }
            setShowDeleteModal(false);
            setDeleteTarget(null);
        } catch (error) {
            console.error('Delete error:', error);
            message.error('Failed to delete task. Please try again.');
            setShowDeleteModal(false);
        }
    };

    const toggleComplete = async (task) => {
        const body = { completed: !task.completed };

        try {
            if (isOnline) {
                const res = await updateTask(task._id, body);
                const localTask = await db.tasks.where('serverId').equals(task._id).first();
                if (localTask) {
                    await db.tasks.update(localTask.id, { completed: res.data.completed, synced: true });
                }
                setTasks(tasks.map((t) => (t._id === task._id ? { ...res.data, synced: true } : t)));
                message.success(`Task marked as ${res.data.completed ? 'completed' : 'pending'}`);
            } else {
                await db.queue.add({
                    action: 'update',
                    data: { id: task._id, body },
                });
                const localTask = await db.tasks.where('serverId').equals(task._id).first();
                if (localTask) {
                    await db.tasks.update(localTask.id, { completed: !task.completed, synced: false });
                } else {
                    await db.tasks.update(task._id, { completed: !task.completed, synced: false });
                }
                setTasks(tasks.map((t) => (t._id === task._id ? { ...t, ...body, synced: false } : t)));
                message.info(`Status change saved offline. It will sync when you are back online.`);
            }
        } catch (error) {
            console.error('Toggle complete error:', error);
            message.error('Failed to update task status. Please try again.');
        }
    };

    const handleCompleteClick = (task) => {
        setCompleteToggleTarget(task);
        setShowCompleteModal(true);
    };

    const confirmCompleteToggle = async () => {
        if (completeToggleTarget) {
            await toggleComplete(completeToggleTarget);
            setShowCompleteModal(false);
            setCompleteToggleTarget(null);
        }
    };

    const filteredTasks = tasks.filter((task) => {
        const matchesSearch = task.title.toLowerCase().includes(searchText.toLowerCase());
        const matchesFilter =
            filterStatus === 'all' ||
            (filterStatus === 'completed' && task.completed) ||
            (filterStatus === 'pending' && !task.completed);
        return matchesSearch && matchesFilter;
    });

    const columns = [
        {
            field: 'completed',
            headerName: 'Completed',
            width: 120,
            renderCell: (params) => (
                <IconButton
                    onClick={() => handleCompleteClick(params.row)}
                    color={params.value ? 'success' : 'default'}
                    size="small"
                >
                    {params.value ? <CheckBoxIcon /> : <CheckBoxOutlineBlankIcon />}
                </IconButton>
            ),
        },
        {
            field: 'title',
            headerName: 'Task',
            flex: 1,
            renderCell: (params) => (
                <span>
                    {params.value}
                    {!params.row.synced && (
                        <span style={{ marginLeft: 8, color: '#f0ad4e' }}>(pending sync)</span>
                    )}
                </span>
            ),
        },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 100,
            renderCell: (params) => (
                <>
                    <IconButton onClick={() => handleOpenEditModal(params.row)} size="small">
                        <EditIcon />
                    </IconButton>
                    <IconButton
                        onClick={() => handleDeleteClick(params.row._id, params.row.title)}
                        size="small"
                        color="error"
                    >
                        <DeleteIcon />
                    </IconButton>
                </>
            ),
        },
    ];

    return (
        <Container fluid className="">
            <Row className="mb-4 d-flex align-items-center justify-content-between">
                <Col xs="auto">
                    <h2 className="mb-0">Task Dashboard</h2>
                </Col>

                <Col xs="auto">
                    <Button variant="primary" onClick={handleOpenAddModal}>
                        Add Task
                    </Button>
                </Col>
            </Row>

            <Row className="mb-3 g-3 d-flex align-items-center justify-content-between">
                <Col md={6}>
                    <TextField
                        fullWidth
                        label="Search tasks"
                        variant="outlined"
                        size="small"
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                    />
                </Col>
                <Col md={4}>
                    <FormControl fullWidth size="small">
                        <InputLabel>Status</InputLabel>
                        <Select
                            value={filterStatus}
                            label="Status"
                            onChange={(e) => setFilterStatus(e.target.value)}
                        >
                            <MenuItem value="all">All</MenuItem>
                            <MenuItem value="completed">Completed</MenuItem>
                            <MenuItem value="pending">Pending</MenuItem>
                        </Select>
                    </FormControl>
                </Col>
            </Row>

            <Row>
                <Col>
                    <div >
                        <DataGrid
                            rows={filteredTasks}
                            columns={columns}
                            getRowId={(row) => row._id}
                            pageSizeOptions={[10, 25, 50]}
                            initialState={{
                                pagination: { paginationModel: { pageSize: 10 } },
                            }}
                            disableRowSelectionOnClick
                            autoHeight
                            hideFooter
                        />
                    </div>
                </Col>
            </Row>

            <Modal show={showModal} onHide={handleCloseModal} centered>
                <Modal.Header closeButton className='border-0'>
                    <Modal.Title>{modalMode === 'add' ? 'Add Task' : 'Edit Task'}</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleModalSubmit}>
                    <Modal.Body>
                        <Form.Group>
                            <Form.Label>Title</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Enter task title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                autoFocus
                            />
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={handleCloseModal}>
                            Cancel
                        </Button>
                        <Button variant="primary" type="submit">
                            {modalMode === 'add' ? 'Add' : 'Update'}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>

            <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
                <Modal.Header closeButton className='border-0'>
                    <Modal.Title>Confirm Delete</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Are you sure you want to delete "{deleteTarget?.title}"?
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
                        Cancel
                    </Button>
                    <Button variant="danger" onClick={confirmDelete}>
                        Delete
                    </Button>
                </Modal.Footer>
            </Modal>

            <Modal show={showCompleteModal} onHide={() => setShowCompleteModal(false)} centered>
                <Modal.Header closeButton className='border-0'>
                    <Modal.Title>Confirm Status Change</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {completeToggleTarget && (
                        <>Are you sure you want to mark "{completeToggleTarget.title}" as {completeToggleTarget.completed ? 'pending' : 'completed'}?</>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowCompleteModal(false)}>
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={confirmCompleteToggle}>
                        Confirm
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
}