import { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useNavigate } from 'react-router-dom';
import { getTasks } from '../api/taskApi';
import { db } from '../utils/db';
import { syncOfflineTasks } from '../utils/syncService';
import useNetworkStatus from '../services/useNetworkStatus';

export default function AnalyticsPage() {
    const [tasks, setTasks] = useState([]);
    const isOnline = useNetworkStatus();
    const navigate = useNavigate();

    useEffect(() => {
        loadTasks();
    }, []);

    useEffect(() => {
        if (isOnline) {
            const syncAndReload = async () => {
                console.log('Syncing offline tasks before analytics...');
                await syncOfflineTasks();
                await loadTasks();
            };
            syncAndReload();
        }
    }, [isOnline]);

    const loadTasks = async () => {
        if (isOnline) {
            const res = await getTasks();
            const serverTasks = res.data.map(t => ({
                ...t,
                synced: true,
                createdAt: t.createdAt ? new Date(t.createdAt) : new Date(),
            }));
            setTasks(serverTasks);
            await db.tasks.clear();
            for (const t of serverTasks) {
                await db.tasks.add({
                    serverId: t._id,
                    title: t.title,
                    completed: t.completed,
                    createdAt: t.createdAt,
                    synced: true,
                });
            }
        } else {
            const local = await db.tasks.toArray();
            setTasks(
                local.map(t => ({
                    _id: t.serverId || t.id,
                    title: t.title,
                    completed: t.completed,
                    createdAt: t.createdAt ? new Date(t.createdAt) : new Date(),
                    synced: t.synced,
                }))
            );
        }
    };

    const completedCount = tasks.filter(t => t.completed).length;
    const pendingCount = tasks.filter(t => !t.completed).length;
    const pieData = [
        { name: 'Completed', value: completedCount },
        { name: 'Pending', value: pendingCount },
    ];
    const COLORS = ['#28a745', '#dc3545'];

    const tasksByDate = tasks.reduce((acc, task) => {
        if (!task.createdAt) return acc;
        const date = task.createdAt.toISOString().split('T')[0]; 
        if (!acc[date]) {
            acc[date] = { date, total: 0, completed: 0 };
        }
        acc[date].total += 1;
        if (task.completed) acc[date].completed += 1;
        return acc;
    }, {});

    const lineData = Object.values(tasksByDate).sort((a, b) => a.date.localeCompare(b.date));

    return (
        <Container fluid className="">
            <Row className="mb-4 align-items-center">
                <Col>
                    <h2>Task Analytics</h2>
                </Col>
             
            </Row>

            <Row className="g-4">
                <Col md={6}>
                    <Card className="shadow-sm h-100">
                        <Card.Body>
                            <Card.Title className="mb-3">Completion Status</Card.Title>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={entry => `${entry.name}: ${entry.value}`}
                                        outerRadius={100}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {pieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </Card.Body>
                    </Card>
                </Col>

                <Col md={6}>
                    <Card className="shadow-sm h-100">
                        <Card.Body>
                            <Card.Title className="mb-3">Tasks Over Time</Card.Title>
                            {lineData.length > 0 ? (
                                <ResponsiveContainer width="100%" height={300}>
                                    <LineChart data={lineData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="date" />
                                        <YAxis allowDecimals={false} />
                                        <Tooltip />
                                        <Legend />
                                        <Line type="monotone" dataKey="total" stroke="#007bff" name="Total Created" />
                                        <Line type="monotone" dataKey="completed" stroke="#28a745" name="Completed" />
                                    </LineChart>
                                </ResponsiveContainer>
                            ) : (
                                <p className="text-muted text-center">No task data available.</p>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>


        </Container>
    );
}