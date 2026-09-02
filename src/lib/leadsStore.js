import fs from "fs";
import path from "path";
import { supabase, isSupabaseConfigured } from "./supabase.js";

const dataDir = path.join(process.cwd(), "data");
const leadsFilePath = path.join(dataDir, "leads.json");

// Ensure local data directory and file exist for local fallback
function ensureLocalDataFile() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  if (!fs.existsSync(leadsFilePath)) {
    fs.writeFileSync(leadsFilePath, JSON.stringify([], null, 2), "utf-8");
  }
}

function getLocalLeads() {
  try {
    ensureLocalDataFile();
    const data = fs.readFileSync(leadsFilePath, "utf-8");
    return JSON.parse(data || "[]");
  } catch (error) {
    console.error("Local leads read error:", error);
    return [];
  }
}

function saveLocalLeads(leads) {
  try {
    ensureLocalDataFile();
    fs.writeFileSync(leadsFilePath, JSON.stringify(leads, null, 2), "utf-8");
    return true;
  } catch (error) {
    console.error("Local leads write error:", error);
    return false;
  }
}

// 1. GET ALL LEADS (Supabase with Local fallback)
export async function getAllLeads() {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from("leads")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      return (data || []).map((row) => ({
        id: row.id,
        firstName: row.first_name,
        lastName: row.last_name,
        phone: row.phone,
        eventMonth: row.event_month,
        status: row.status,
        visitDate: row.visit_date,
        notes: row.notes,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      }));
    } catch (err) {
      console.error("Supabase getAllLeads error, falling back to local:", err);
      return getLocalLeads();
    }
  }

  return getLocalLeads();
}

// 2. CREATE LEAD (Supabase with Local fallback)
export async function createLead({ firstName, lastName, eventMonth, phone, notes = "" }) {
  const newLeadId = `lead_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date().toISOString();

  const formattedLead = {
    id: newLeadId,
    firstName: firstName?.trim() || "",
    lastName: lastName?.trim() || "",
    eventMonth: eventMonth?.trim() || "",
    phone: phone?.trim() || "",
    notes: notes?.trim() || "",
    status: "NEW",
    visitDate: "",
    createdAt: now,
  };

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from("leads")
        .insert([
          {
            id: newLeadId,
            first_name: formattedLead.firstName,
            last_name: formattedLead.lastName,
            event_month: formattedLead.eventMonth,
            phone: formattedLead.phone,
            notes: formattedLead.notes,
            status: "NEW",
            visit_date: "",
            created_at: now,
            updated_at: now,
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return formattedLead;
    } catch (err) {
      console.error("Supabase createLead error, falling back to local:", err);
    }
  }

  // Local fallback
  const leads = getLocalLeads();
  leads.unshift(formattedLead);
  saveLocalLeads(leads);
  return formattedLead;
}

// 3. UPDATE LEAD (Supabase with Local fallback)
export async function updateLeadStatus(id, updates) {
  const now = new Date().toISOString();

  if (isSupabaseConfigured && supabase) {
    try {
      const supabaseUpdates = { updated_at: now };
      if (updates.status !== undefined) supabaseUpdates.status = updates.status;
      if (updates.notes !== undefined) supabaseUpdates.notes = updates.notes;
      if (updates.visitDate !== undefined) supabaseUpdates.visit_date = updates.visitDate;

      const { data, error } = await supabase
        .from("leads")
        .update(supabaseUpdates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      if (data) {
        return {
          id: data.id,
          firstName: data.first_name,
          lastName: data.last_name,
          phone: data.phone,
          eventMonth: data.event_month,
          status: data.status,
          visitDate: data.visit_date,
          notes: data.notes,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        };
      }
    } catch (err) {
      console.error("Supabase updateLeadStatus error, falling back to local:", err);
    }
  }

  // Local fallback
  const leads = getLocalLeads();
  const index = leads.findIndex((l) => l.id === id);
  if (index === -1) return null;

  leads[index] = {
    ...leads[index],
    ...updates,
    updatedAt: now,
  };

  saveLocalLeads(leads);
  return leads[index];
}

// 4. DELETE LEAD (Supabase with Local fallback)
export async function deleteLeadById(id) {
  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase.from("leads").delete().eq("id", id);
      if (error) throw error;
      return true;
    } catch (err) {
      console.error("Supabase deleteLeadById error, falling back to local:", err);
    }
  }

  // Local fallback
  const leads = getLocalLeads();
  const filtered = leads.filter((l) => l.id !== id);
  if (filtered.length === leads.length) return false;
  saveLocalLeads(filtered);
  return true;
}
