"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { toast } from "react-hot-toast";
import debounce from "lodash.debounce";
// Corrected import path
import ChangeAvatarModal from "@/components/ChangeAvatarModal/ChangeAvatarModal";
import styles from "./UserManagementTable.module.css";

export default function UserManagementTable() {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchUsers = useCallback(async (search = "") => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/users?search=${search}`);
      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const debouncedFetch = useCallback(debounce(fetchUsers, 300), [fetchUsers]);

  useEffect(() => {
    fetchUsers(); // Initial fetch
  }, [fetchUsers]);

  useEffect(() => {
    debouncedFetch(searchTerm);
  }, [searchTerm, debouncedFetch]);

  const handleRoleChange = async (userId, newRole) => {
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });

      if (!response.ok) {
        throw new Error("Failed to update role");
      }

      setUsers(
        users.map((user) =>
          user.id === userId ? { ...user, role: newRole } : user
        )
      );
      toast.success("User role updated successfully!");
    } catch (error) {
      toast.error("Failed to update role.");
    }
  };

  const handleStatusChange = async (userId, newStatus) => {
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error("Failed to update status");
      }

      setUsers(
        users.map((user) =>
          user.id === userId ? { ...user, status: newStatus } : user
        )
      );
      toast.success("User status updated successfully!");
    } catch (error) {
      toast.error("Failed to update status.");
    }
  };

  const handleAvatarChange = (userId, newImageUrl) => {
    setUsers(
      users.map((user) =>
        user.id === userId ? { ...user, imageUrl: newImageUrl } : user
      )
    );
  };

  const openModalForUser = (user) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  return (
    <>
      <div className={styles.controlsContainer}>
        <input
          type="text"
          placeholder="Search by username or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={styles.searchInput}
        />
      </div>
      <div className={styles.tableContainer}>
        <table className={styles.userTable}>
          <thead>
            <tr>
              <th>Avatar</th>
              <th>Username</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan="6" className={styles.loadingCell}>
                  Loading users...
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id}>
                  <td>
                    <Image
                      src={user.imageUrl || "/images/default-avatar.png"}
                      alt={user.username}
                      width={40}
                      height={40}
                      className={styles.avatar}
                    />
                  </td>
                  <td>{user.username}</td>
                  <td>{user.email}</td>
                  <td>
                    <select
                      value={user.role}
                      onChange={(e) =>
                        handleRoleChange(user.id, e.target.value)
                      }
                      className={styles.roleSelect}
                    >
                      <option value="USER">USER</option>
                      <option value="ADMIN">ADMIN</option>
                      <option value="OWNER">OWNER</option>
                    </select>
                  </td>
                  <td>
                    <span
                      className={`${styles.statusPill} ${
                        user.status === "active"
                          ? styles.activeStatus
                          : styles.bannedStatus
                      }`}
                    >
                      {user.status}
                    </span>
                  </td>
                  <td className={styles.actionsCell}>
                    <button
                      onClick={() => openModalForUser(user)}
                      className={`${styles.actionButton} ${styles.changeAvatarButton}`}
                    >
                      Change Avatar
                    </button>
                    {user.status === "active" ? (
                      <button
                        onClick={() => handleStatusChange(user.id, "banned")}
                        className={`${styles.actionButton} ${styles.banButton}`}
                      >
                        Ban
                      </button>
                    ) : (
                      <button
                        onClick={() => handleStatusChange(user.id, "active")}
                        className={`${styles.actionButton} ${styles.unbanButton}`}
                      >
                        Unban
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && selectedUser && (
        <ChangeAvatarModal
          user={selectedUser}
          onClose={() => setIsModalOpen(false)}
          onAvatarChange={handleAvatarChange}
        />
      )}
    </>
  );
}
