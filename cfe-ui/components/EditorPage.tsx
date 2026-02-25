'use client';
import { SimpleEditor } from "../src/components/tiptap-templates/simple/simple-editor";
import FileExplorer from "./file-explorer/FileExplorer";
import CommentsPanel from "./CommentsPanel";
import { signOut } from "next-auth/react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { UserView } from "../models/user";
import { useState } from "react";

export default function EditorPage() {
  const { data: session } = useSession();
  console.log(session);
  const router = useRouter();

  const handleLogout = async (): Promise<void> => {
    UserView.getInstance().reset();
    await signOut({ redirect: false });  // da se ne desi automatski redirect
    router.push("/");
    console.log("Logout clicked");
  };
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [showComments, setShowComments] = useState(false);
  
  return (
    <div className="flex h-screen">
      <div className="w-[25%] bg-transparent">
        <FileExplorer onSelectFile={setSelectedFileId} />
      </div>

      {/* Srednji deo sa editorom (80%) */}
      <div className="w-[67%] flex flex-col">
        <SimpleEditor key={selectedFileId ?? "none"} fileId={selectedFileId} />

      </div>

      {/* Desni deo sa logout dugmetom (5%) */}
      <div className="w-[8%] p-2 flex flex-col">
        <div className="mt-[60px]">
          <button
            onClick={handleLogout}
            className="
              min-w-[100px]
              flex-shrink-0
              bg-red-600
              hover:bg-red-700
              text-white 
              font-semibold
              py-2 px-4 rounded-md shadow-md transition duration-300
              ease-in-out focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-1 w-full"
          >
            Logout
          </button>
        </div>
      </div>

              <button
          onClick={() => setShowComments((p) => !p)}
          disabled={!selectedFileId}
          className="px-3 py-2 rounded bg-slate-700 text-white disabled:opacity-50"
        >
          Komentari
        </button>

        {showComments && selectedFileId && (
          <CommentsPanel fileId={selectedFileId} />
        )}
    </div>
  );
}
