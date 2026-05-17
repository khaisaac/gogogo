"use client";

import { useState } from "react";
import styles from "../../bookings/bookings.module.css";
import { Trash2, Plus, Save, X } from "lucide-react";

export default function GatesTable({ initialGates }: { initialGates: any[] }) {
  const [gates, setGates] = useState(initialGates);
  const [isAdding, setIsAdding] = useState(false);
  const [newGate, setNewGate] = useState({ name: "", image: "", is_active: true });

  const handleAdd = async () => {
    if (!newGate.name) return;
    try {
      const res = await fetch("/api/tickets/gates/manage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newGate),
      });
      if (res.ok) {
        const added = await res.json();
        setGates([...gates, added]);
        setIsAdding(false);
        setNewGate({ name: "", image: "", is_active: true });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this gate?")) return;
    try {
      const res = await fetch(`/api/tickets/gates/manage?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setGates(gates.filter((g) => g.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const toggleStatus = async (gate: any) => {
    try {
      const res = await fetch("/api/tickets/gates/manage", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: gate.id, is_active: !gate.is_active }),
      });
      if (res.ok) {
        setGates(gates.map((g) => g.id === gate.id ? { ...g, is_active: !g.is_active } : g));
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className={styles.tableWrapper}>
      <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'flex-end' }}>
        <button 
          onClick={() => setIsAdding(true)} 
          className={styles.addBtn}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', backgroundColor: '#1a4d43', color: 'white', borderRadius: '8px', border: 'none', cursor: 'pointer' }}
        >
          <Plus size={18} /> Add New Gate
        </button>
      </div>

      {isAdding && (
        <div style={{ backgroundColor: '#f9f9f9', padding: '20px', borderRadius: '12px', marginBottom: '20px', border: '1px solid #ddd' }}>
          <h3 style={{ marginBottom: '16px' }}>Add New Gate</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.875rem' }}>Gate Name</label>
              <input 
                type="text" 
                value={newGate.name} 
                onChange={(e) => setNewGate({...newGate, name: e.target.value})}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.875rem' }}>Image URL</label>
              <input 
                type="text" 
                value={newGate.image} 
                onChange={(e) => setNewGate({...newGate, image: e.target.value})}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }}
              />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button onClick={() => setIsAdding(false)} style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid #ccc', background: 'none' }}>Cancel</button>
            <button onClick={handleAdd} style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', backgroundColor: '#1a4d43', color: 'white' }}>Save Gate</button>
          </div>
        </div>
      )}

      <table className={styles.table}>
        <thead>
          <tr>
            <th>Image</th>
            <th>Name</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {gates.map((gate) => (
            <tr key={gate.id}>
              <td>
                {gate.image ? (
                  <img src={gate.image} alt={gate.name} style={{ width: '60px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />
                ) : (
                  <div style={{ width: '60px', height: '40px', background: '#eee', borderRadius: '4px' }} />
                )}
              </td>
              <td style={{ fontWeight: 600 }}>{gate.name}</td>
              <td>
                <button 
                  onClick={() => toggleStatus(gate)}
                  style={{ 
                    padding: '4px 12px', 
                    borderRadius: '20px', 
                    border: 'none', 
                    fontSize: '0.75rem',
                    backgroundColor: gate.is_active ? '#dcfce7' : '#fee2e2',
                    color: gate.is_active ? '#166534' : '#991b1b',
                    cursor: 'pointer'
                  }}
                >
                  {gate.is_active ? "Active" : "Inactive"}
                </button>
              </td>
              <td>
                <button 
                  onClick={() => handleDelete(gate.id)}
                  className={styles.deleteBtn}
                >
                  <Trash2 size={16} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
