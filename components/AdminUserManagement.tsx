import React, { useState, useEffect } from 'react';
import { db, collection, onSnapshot, doc, updateDoc, handleFirestoreError, OperationType } from '../firebase';
import { CitizenProfile } from '../types';
import GlassCard from '../src/components/GlassCard';
import { Shield, User, Save } from 'lucide-react';

const AdminUserManagement: React.FC = () => {
  const [users, setUsers] = useState<CitizenProfile[]>([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'users'), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CitizenProfile));
      setUsers(data);
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'users'));

    return () => unsubscribe();
  }, []);

  const updateRole = async (userId: string, newRole: CitizenProfile['role']) => {
    try {
      await updateDoc(doc(db, 'users', userId), { role: newRole });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${userId}`);
    }
  };

  return (
    <GlassCard className="p-8">
      <h2 className="text-2xl font-black text-slate-800 mb-6 flex items-center gap-2">
        <Shield className="text-blue-500" />
        Admin User Management
      </h2>
      <div className="space-y-4">
        {users.map(user => (
          <div key={user.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="text-blue-600" size={20} />
              </div>
              <div>
                <p className="font-bold text-slate-800">{user.name}</p>
                <p className="text-xs text-slate-500">{user.email}</p>
              </div>
            </div>
            <select 
              value={user.role} 
              onChange={(e) => updateRole(user.id, e.target.value as CitizenProfile['role'])}
              className="bg-white border border-slate-200 rounded-lg p-2 text-sm font-bold text-slate-700"
            >
              <option value="Warga Berkarya">Warga Berkarya</option>
              <option value="Warga Berdaya">Warga Berdaya</option>
              <option value="Warga Bergerak">Warga Bergerak</option>
              <option value="Lurah / Admin">Lurah / Admin</option>
            </select>
          </div>
        ))}
      </div>
    </GlassCard>
  );
};

export default AdminUserManagement;
