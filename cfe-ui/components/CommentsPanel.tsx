"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { getRequestSingle, postRequest, putRequest, deleteRequest } from "../src/app/api/serverRequests/methods";

type Commenter = { _id: string; username: string };

type CommentDto = {
  _id: string;
  content: string;
  commenter: string | Commenter; // zavisi da li backend populuje
  createdAt?: string;
  edited?: boolean;
};

export default function CommentsPanel({ fileId }: { fileId: string }) {
  const { data: session } = useSession();
  const myUserId = (session?.user as any)?.id as string | undefined;

  const [comments, setComments] = useState<CommentDto[]>([]);
  const [newText, setNewText] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchComments = async () => {
    setLoading(true);
    try {
      const res = await getRequestSingle(`files/${fileId}/comments`);
      if (!res.ok) return;

      const payload = await res.json();
      const data = payload?.data ?? payload;
      setComments(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [fileId]);

  const getUsername = (c: CommentDto) => {
    if (typeof c.commenter === "object" && c.commenter?.username) return c.commenter.username;
    // fallback ako backend ne populuje username:
    if (myUserId && c.commenter === myUserId) return (session?.user as any)?.username ?? "me";
    return "unknown";
  };

  const addComment = async () => {
    if (!newText.trim() || !myUserId) return;

    const res = await postRequest("comments/create", {
        content: newText.trim(),
        file: fileId,        //backend očekuje "file"
        commenter: myUserId,
    });

    const errPayload = await res.json().catch(() => null);
    console.log("create comment status:", res.status);
    console.log("create comment response:", errPayload);
    if (!res.ok) return;

    if (res.ok) {
      setNewText("");
      await fetchComments();
    }
  };

  const updateComment = async (commentId: string, content: string) => {
    const res = await putRequest(`comments/${commentId}/update`, { content });
    if (res.ok) await fetchComments();
  };

  const removeComment = async (commentId: string) => {
    const res = await deleteRequest(`comments/${commentId}/delete`);
    if (res.ok) await fetchComments();
  };

  return (
    <div className="w-[33%] h-full border-l border-slate-700 p-3 overflow-y-auto bg-slate-900 text-white">
      <div className="font-semibold mb-3">Komentari</div>

      <div className="flex gap-2 mb-4">
        <input
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
          placeholder="Napiši komentar..."
          className="flex-1 px-3 py-2 rounded bg-slate-800 border border-slate-700"
        />
        <button onClick={addComment} className="px-3 py-2 rounded bg-blue-600">
          Dodaj
        </button>
      </div>

      {loading ? (
        <div className="text-slate-400">Učitavam...</div>
      ) : comments.length === 0 ? (
        <div className="text-slate-400">Nema komentara.</div>
      ) : (
        <div className="flex flex-col gap-3">
          {comments.map((c) => (
            <CommentItem
              key={c._id}
              comment={c}
              username={getUsername(c)}
              canEdit={!!myUserId && (typeof c.commenter === "string" ? c.commenter === myUserId : c.commenter._id === myUserId)}
              onUpdate={updateComment}
              onDelete={removeComment}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function CommentItem({
  comment,
  username,
  canEdit,
  onUpdate,
  onDelete,
}: {
  comment: { _id: string; content: string; edited?: boolean };
  username: string;
  canEdit: boolean;
  onUpdate: (id: string, content: string) => void;
  onDelete: (id: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(comment.content);

  useEffect(() => setText(comment.content), [comment.content]);

  return (
    <div className="rounded border border-slate-700 bg-slate-800 p-3">
      <div className="text-sm text-slate-300 mb-2 flex justify-between">
        <span>@{username}{comment.edited ? " (edited)" : ""}</span>
        {canEdit && (
          <div className="flex gap-2">
            <button className="text-xs text-yellow-300" onClick={() => setEditing((p) => !p)}>
              {editing ? "Otkaži" : "Izmeni"}
            </button>
            <button className="text-xs text-red-300" onClick={() => onDelete(comment._id)}>
              Obriši
            </button>
          </div>
        )}
      </div>

      {editing ? (
        <div className="flex gap-2">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="flex-1 px-3 py-2 rounded bg-slate-900 border border-slate-700"
          />
          <button
            className="px-3 py-2 rounded bg-green-600"
            onClick={() => {
              onUpdate(comment._id, text);
              setEditing(false);
            }}
          >
            Sačuvaj
          </button>
        </div>
      ) : (
        <div>{comment.content}</div>
      )}
    </div>
  );
}