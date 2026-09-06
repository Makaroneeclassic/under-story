import fs from "fs";
import path from "path";
import { supabase, isSupabaseConfigured } from "./supabase.js";

const dataDir = path.join(process.cwd(), "data");
const settingsFilePath = path.join(dataDir, "settings.json");

const defaultSettings = {
  enableGTM: false,
  gtmId: "",
  enableGA4: false,
  ga4Id: "",
  enableFBPixel: false,
  fbPixelId: "",
  enableTikTokPixel: false,
  tiktokPixelId: "",
  customHeadScript: "",
  customBodyScript: "",
  enableLineNotify: false,
  lineChannelAccessToken: "",
  lineTargetId: "",
  updatedAt: new Date().toISOString(),
};

function ensureLocalSettingsFile() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  if (!fs.existsSync(settingsFilePath)) {
    fs.writeFileSync(settingsFilePath, JSON.stringify(defaultSettings, null, 2), "utf-8");
  }
}

function getLocalSettings() {
  try {
    ensureLocalSettingsFile();
    const data = fs.readFileSync(settingsFilePath, "utf-8");
    return { ...defaultSettings, ...JSON.parse(data || "{}") };
  } catch (error) {
    console.error("Error reading local settings:", error);
    return defaultSettings;
  }
}

function saveLocalSettings(settings) {
  try {
    ensureLocalSettingsFile();
    fs.writeFileSync(settingsFilePath, JSON.stringify(settings, null, 2), "utf-8");
    return settings;
  } catch (error) {
    console.error("Error saving local settings:", error);
    return defaultSettings;
  }
}

// 1. GET SETTINGS (Supabase with Local fallback)
export async function getSettings() {
  const local = getLocalSettings();

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from("settings")
        .select("*")
        .eq("id", "global")
        .maybeSingle();

      if (error) throw error;

      if (data) {
        return {
          enableGTM: Boolean(data.enable_gtm),
          gtmId: data.gtm_id || "",
          enableGA4: Boolean(data.enable_ga4),
          ga4Id: data.ga4_id || "",
          enableFBPixel: Boolean(data.enable_fb_pixel),
          fbPixelId: data.fb_pixel_id || "",
          enableTikTokPixel: Boolean(data.enable_tiktok_pixel),
          tiktokPixelId: data.tiktok_pixel_id || "",
          customHeadScript: data.custom_head_script || "",
          customBodyScript: data.custom_body_script || "",
          enableLineNotify:
            data.enable_line_notify !== undefined
              ? Boolean(data.enable_line_notify)
              : local.enableLineNotify,
          lineChannelAccessToken:
            data.line_channel_access_token || local.lineChannelAccessToken || "",
          lineTargetId: data.line_target_id || local.lineTargetId || "",
          updatedAt: data.updated_at || local.updatedAt,
        };
      }
    } catch (err) {
      console.error("Supabase getSettings error, falling back to local:", err);
    }
  }

  return local;
}

// 2. UPDATE SETTINGS (Supabase with Local fallback)
export async function updateSettings(newSettings) {
  const current = await getSettings();
  const updated = {
    ...current,
    ...newSettings,
    updatedAt: new Date().toISOString(),
  };

  // Always save to local backup
  saveLocalSettings(updated);

  if (isSupabaseConfigured && supabase) {
    try {
      // First try full payload with LINE settings
      const fullPayload = {
        enable_gtm: updated.enableGTM,
        gtm_id: updated.gtmId,
        enable_ga4: updated.enableGA4,
        ga4_id: updated.ga4Id,
        enable_fb_pixel: updated.enableFBPixel,
        fb_pixel_id: updated.fbPixelId,
        enable_tiktok_pixel: updated.enableTikTokPixel,
        tiktok_pixel_id: updated.tiktokPixelId,
        custom_head_script: updated.customHeadScript,
        custom_body_script: updated.customBodyScript,
        enable_line_notify: updated.enableLineNotify,
        line_channel_access_token: updated.lineChannelAccessToken,
        line_target_id: updated.lineTargetId,
        updated_at: updated.updatedAt,
      };

      const { data: updateData, error: updateError } = await supabase
        .from("settings")
        .update(fullPayload)
        .eq("id", "global")
        .select();

      if (!updateError && (!updateData || updateData.length === 0)) {
        await supabase.from("settings").insert({ id: "global", ...fullPayload });
      }

      // If error occurred (e.g. columns don't exist yet in Supabase), fallback to base payload
      if (updateError) {
        console.warn(
          "Supabase update with full payload failed, trying base tracking payload:",
          updateError.message
        );
        const basePayload = {
          enable_gtm: updated.enableGTM,
          gtm_id: updated.gtmId,
          enable_ga4: updated.enableGA4,
          ga4_id: updated.ga4Id,
          enable_fb_pixel: updated.enableFBPixel,
          fb_pixel_id: updated.fbPixelId,
          enable_tiktok_pixel: updated.enableTikTokPixel,
          tiktok_pixel_id: updated.tiktokPixelId,
          custom_head_script: updated.customHeadScript,
          custom_body_script: updated.customBodyScript,
          updated_at: updated.updatedAt,
        };

        await supabase.from("settings").update(basePayload).eq("id", "global");
      }

      return updated;
    } catch (err) {
      console.error("Supabase updateSettings error, local settings preserved:", err);
    }
  }

  return updated;
}
