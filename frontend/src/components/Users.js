import React, { useEffect, useState } from "react";
import { fetchUsers } from "../api";

const Users = () => {
    const [users, setUsers] = useState([]);

    useEffect(() => {
        const getUsers = async () => {
            try {
                const { data } = await fetchUsers();
                setUsers(data);
            } catch (error) {
                console.error("Error fetching users:", error);
            }
        };
        getUsers();
    }, []);

    return (
        <div>
            <h2>Users</h2>
            <ul>
                {users.map((user) => (
                    <li key={user.id}>
                        {user.username} ({user.email})
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Users;
