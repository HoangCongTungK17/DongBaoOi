import React from "react";
import { AlertTriangle, X } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { deleteUser } from "../../Redux/Admin/Action";
import { toast } from "sonner";

function DeleteUserDialog({ isOpen, onClose, user }) {
    const dispatch = useDispatch();
    const { loading } = useSelector((store) => store.adminStore);

    const handleDelete = async () => {
        const result = await dispatch(deleteUser(user.id));
        if (result.success) {
            toast.success("User deleted successfully!");
            onClose();
        } else {
            toast.error("Failed to delete user");
        }
    };

    if (!isOpen || !user) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-100 rounded-lg">
                            <AlertTriangle className="h-5 w-5 text-red-600" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-800">Delete User</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X className="h-5 w-5 text-gray-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    <p className="text-gray-600 mb-4">
                        Are you sure you want to delete user{" "}
                        <span className="font-semibold text-gray-800">{user.fullname || user.email}</span>?
                        This action cannot be undone.
                    </p>

                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                        <p className="text-sm text-red-800">
                            <strong>Warning:</strong> All data associated with this user will be permanently deleted.
                        </p>
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-3 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleDelete}
                            disabled={loading}
                            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                        >
                            {loading ? "Deleting..." : "Delete User"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default DeleteUserDialog;
