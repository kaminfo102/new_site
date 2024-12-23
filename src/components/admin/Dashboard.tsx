import React, { useState, useEffect } from 'react';
import { UserTable } from './UserTable';
import { UserModal } from './UserModal';
import type { User } from '../../types/user';


export function Dashboard() {
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('adminToken');
            if (!token) {
                console.error('No token found');
                setError('توکن معتبر یافت نشد');
                return;
            }

            const response = await fetch('http://localhost:8000/users', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setUsers(data);
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Failed to fetch users');
            console.error('Failed to fetch users:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (user: Omit<User, 'id' | 'created_at' | 'last_login'>) => {
        try {
            const token = localStorage.getItem('adminToken');
            if(!token){
               console.log("no token found");
               setError('توکن معتبر یافت نشد');
               return;
           }
           const response = await fetch('http://localhost:8000/users', {
               method: 'POST',
               headers: {
                   'Content-Type': 'application/json',
                   'Authorization': `Bearer ${token}`
               },
               body: JSON.stringify(user)
           });

           if(!response.ok){
               const errorData = await response.json()
               throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
           }
           const newUser = await response.json();
           setUsers((prevUsers) => [...prevUsers, newUser]);
           closeModal();
       } catch(error){
           setError(error instanceof Error ? error.message : 'Failed to create user');
           console.error('Failed to create user:', error)
       }
    };

    const handleEdit = async (user: User) => {
      try {
        const token = localStorage.getItem('adminToken');
        if (!token) {
            setError('توکن معتبر یافت نشد');
            return;
        }
        const response = await fetch(`http://localhost:8000/users/${user.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(user)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
        }
        const updatedUser = await response.json();
        setUsers((prevUsers) => prevUsers.map((u) => (u.id === updatedUser.id ? updatedUser : u)));
        closeModal();
        }catch (error) {
            setError(error instanceof Error ? error.message : 'Failed to update user');
            console.error('Failed to update user:', error);
      }

    };
    const handleDelete = async (userId: number) => {
        try {
          const token = localStorage.getItem('adminToken');
            if (!token) {
              setError('توکن معتبر یافت نشد');
                return;
            }
          const response = await fetch(`http://localhost:8000/users/${userId}`, {
            method: 'DELETE',
            headers: {
               'Authorization': `Bearer ${token}`
            }
        });

        if(!response.ok){
           const errorData = await response.json()
           throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
        }

        setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId));
    }catch(error){
        setError(error instanceof Error ? error.message : "Failed to delete user");
         console.error("Failed to delete user:", error);
    }
};


    const openModal = (user: User | null = null) => {
        setSelectedUser(user);
        setModalOpen(true);
    };

    const closeModal = () => {
        setSelectedUser(null);
        setModalOpen(false);
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    return (
     
        <div>
            <h2>Dashboard</h2>
             {error && <p style={{ color: 'red' }}>{error}</p>}
            {isLoading ? (<p>Loading users...</p>) :
                ( <UserTable users={users} onEdit={openModal} onDelete={handleDelete}/>)}
            <button onClick={() => openModal()}>Create User</button>
            <UserModal
                 isOpen={isModalOpen}
                onClose={closeModal}
                onSubmit={selectedUser ? handleEdit : handleCreate}
                user={selectedUser}
            />
        </div>
      
    );
}

