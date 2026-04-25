"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import styles from "./dashboard.module.css";

export default function ProfileSettings({ user }: { user: any }) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    full_name: "",
    whatsapp: "",
  });

  useEffect(() => {
    const fetchProfile = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("profiles")
        .select("full_name, whatsapp")
        .eq("id", user.id)
        .single();
        
      if (data) {
        setFormData({
          full_name: data.full_name || "",
          whatsapp: data.whatsapp || "",
        });
      }
    };
    fetchProfile();
  }, [user.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess("");
    setError("");

    const supabase = createClient();
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        full_name: formData.full_name,
        whatsapp: formData.whatsapp,
      })
      .eq("id", user.id);

    if (updateError) {
      setError(updateError.message);
    } else {
      setSuccess("Profile updated successfully!");
    }
    
    setLoading(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({...prev, [e.target.name]: e.target.value}));
  };

  return (
    <div>
      <h2 className={styles.contentTitle}>Profile Settings</h2>
      
      {success && <div className={`${styles.alert} ${styles.alertSuccess}`}>{success}</div>}
      {error && <div className={`${styles.alert} ${styles.alertError}`}>{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label>Email Address</label>
          <input 
            type="email" 
            className={styles.input} 
            value={user.email} 
            disabled 
          />
        </div>
        
        <div className={styles.formGroup}>
          <label>Full Name</label>
          <input 
            type="text" 
            name="full_name"
            className={styles.input} 
            value={formData.full_name}
            onChange={handleChange}
            placeholder="e.g. John Doe"
          />
        </div>

        <div className={styles.formGroup}>
          <label>WhatsApp Number</label>
          <input 
            type="text" 
            name="whatsapp"
            className={styles.input} 
            value={formData.whatsapp}
            onChange={handleChange}
            placeholder="e.g. +62812..."
          />
        </div>

        <button 
          type="submit" 
          className={styles.submitBtn}
          disabled={loading}
        >
          {loading ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
}
