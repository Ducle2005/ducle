"use client";

import { useState, useRef } from "react";
import { Camera, Loader2, User } from "lucide-react";
import Image from "next/image";
import { API_BASE_URL, getFullImageUrl } from "@/lib/api";

interface AvatarUploadProps {
  currentAvatarUrl?: string;
  onUploadSuccess: (url: string) => void;
  token: string;
}

export function AvatarUpload({ currentAvatarUrl, onUploadSuccess, token }: AvatarUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentAvatarUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Local preview before upload
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);

    setIsUploading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`${API_BASE_URL}/users/me/avatar`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        onUploadSuccess(data.avatarUrl);
      } else {
        const errorText = await res.text();
        console.error(`Failed to upload avatar: ${res.status} ${res.statusText}`, errorText);
        // Revert local preview if failed
        setPreview(currentAvatarUrl || null);
      }
    } catch (error) {
      console.error("Error uploading avatar:", error);
      setPreview(currentAvatarUrl || null);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative group">
        <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-emerald-500 bg-slate-800 flex items-center justify-center">
          {preview ? (
            <Image
              src={
                preview.startsWith("http") || preview.startsWith("blob:") || preview.startsWith("data:")
                  ? preview
                  : getFullImageUrl(preview)
              }
              alt="Avatar"
              width={96}
              height={96}
              className="object-cover w-full h-full"
            />
          ) : (
            <User className="w-12 h-12 text-slate-400" />
          )}
        </div>
        
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="absolute bottom-0 right-0 p-2 bg-emerald-500 rounded-full text-white shadow-lg hover:bg-emerald-600 transition-colors disabled:opacity-50"
        >
          {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
        </button>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />
      
      <p className="text-sm text-slate-400">JPG, GIF or PNG. Max size of 800K</p>
    </div>
  );
}
