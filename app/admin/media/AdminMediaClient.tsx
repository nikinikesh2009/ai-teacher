"use client";

import { useEffect, useState } from "react";

type Channel = { id: string; channel_id: string; name: string; created_at: string };
type Video = { id: string; video_id: string; title: string; lesson_topic: string | null; created_at: string };
type LinkItem = { id: string; url: string; title: string; description: string | null; created_at: string };

export function AdminMediaClient() {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"channels" | "videos" | "links">("channels");

  // Form state
  const [channelId, setChannelId] = useState("");
  const [channelName, setChannelName] = useState("");
  const [videoId, setVideoId] = useState("");
  const [videoTitle, setVideoTitle] = useState("");
  const [videoTopic, setVideoTopic] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [linkTitle, setLinkTitle] = useState("");
  const [linkDesc, setLinkDesc] = useState("");

  const load = () => {
    setLoading(true);
    setError(null);
    fetch("/api/admin/media")
      .then((r) => r.json())
      .then((data) => {
        if (data.error) setError(data.error);
        else {
          setChannels(data.channels ?? []);
          setVideos(data.videos ?? []);
          setLinks(data.links ?? []);
        }
      })
      .catch(() => setError("Failed to load"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const addChannel = (e: React.FormEvent) => {
    e.preventDefault();
    fetch("/api/admin/media", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "youtube_channel", channel_id: channelId, name: channelName }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.error) setError(data.error);
        else {
          setError(null);
          setChannelId("");
          setChannelName("");
          load();
        }
      });
  };

  const addVideo = (e: React.FormEvent) => {
    e.preventDefault();
    fetch("/api/admin/media", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "youtube_video",
        video_id: videoId,
        title: videoTitle,
        lesson_topic: videoTopic || undefined,
      }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.error) setError(data.error);
        else {
          setError(null);
          setVideoId("");
          setVideoTitle("");
          setVideoTopic("");
          load();
        }
      });
  };

  const addLink = (e: React.FormEvent) => {
    e.preventDefault();
    fetch("/api/admin/media", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "educational_link",
        url: linkUrl,
        title: linkTitle,
        description: linkDesc || undefined,
      }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.error) setError(data.error);
        else {
          setError(null);
          setLinkUrl("");
          setLinkTitle("");
          setLinkDesc("");
          load();
        }
      });
  };

  const remove = (type: "youtube_channel" | "youtube_video" | "educational_link", id: string) => {
    if (!confirm("Remove this item?")) return;
    fetch("/api/admin/media", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, id }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.error) setError(data.error);
        else load();
      });
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-8 shadow-[var(--shadow-soft)]">
        <div className="mb-4 flex gap-2 border-b border-[var(--color-border)]">
          {(["channels", "videos", "links"] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`border-b-2 px-4 py-2 text-sm font-medium ${
                activeTab === tab
                  ? "border-[var(--color-accent)] text-[var(--color-accent)]"
                  : "border-transparent text-[var(--color-text-sub)] hover:text-[var(--color-text-main)]"
              }`}
            >
              {tab === "channels" && "YouTube channels"}
              {tab === "videos" && "YouTube videos"}
              {tab === "links" && "Educational links"}
            </button>
          ))}
        </div>

        {activeTab === "channels" && (
          <>
            <h2 className="mb-3 text-lg font-medium text-[var(--color-text-main)]">
              Add YouTube channel
            </h2>
            <form onSubmit={addChannel} className="mb-6 flex flex-wrap gap-3">
              <input
                type="text"
                placeholder="Channel ID"
                value={channelId}
                onChange={(e) => setChannelId(e.target.value)}
                className="rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm"
                required
              />
              <input
                type="text"
                placeholder="Name"
                value={channelName}
                onChange={(e) => setChannelName(e.target.value)}
                className="rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm"
                required
              />
              <button
                type="submit"
                className="rounded-lg bg-[var(--color-accent)] px-4 py-2 text-sm text-white hover:brightness-110"
              >
                Add
              </button>
            </form>
            <h2 className="mb-2 text-lg font-medium text-[var(--color-text-main)]">
              Saved channels
            </h2>
            {loading ? (
              <p className="text-sm text-[var(--color-text-sub)]">Loading...</p>
            ) : (
              <ul className="space-y-2">
                {channels.map((c) => (
                  <li
                    key={c.id}
                    className="flex items-center justify-between rounded-lg border border-[var(--color-border)] p-2"
                  >
                    <span className="text-sm">{c.name} ({c.channel_id})</span>
                    <button
                      type="button"
                      onClick={() => remove("youtube_channel", c.id)}
                      className="text-sm text-[var(--color-danger)] hover:underline"
                    >
                      Remove
                    </button>
                  </li>
                ))}
                {channels.length === 0 && (
                  <li className="text-sm text-[var(--color-text-sub)]">None yet.</li>
                )}
              </ul>
            )}
          </>
        )}

        {activeTab === "videos" && (
          <>
            <h2 className="mb-3 text-lg font-medium text-[var(--color-text-main)]">
              Add YouTube video
            </h2>
            <form onSubmit={addVideo} className="mb-6 flex flex-wrap gap-3">
              <input
                type="text"
                placeholder="Video ID"
                value={videoId}
                onChange={(e) => setVideoId(e.target.value)}
                className="rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm"
                required
              />
              <input
                type="text"
                placeholder="Title"
                value={videoTitle}
                onChange={(e) => setVideoTitle(e.target.value)}
                className="rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm"
                required
              />
              <input
                type="text"
                placeholder="Lesson topic (optional)"
                value={videoTopic}
                onChange={(e) => setVideoTopic(e.target.value)}
                className="rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm"
              />
              <button
                type="submit"
                className="rounded-lg bg-[var(--color-accent)] px-4 py-2 text-sm text-white hover:brightness-110"
              >
                Add
              </button>
            </form>
            <h2 className="mb-2 text-lg font-medium text-[var(--color-text-main)]">
              Saved videos
            </h2>
            {loading ? (
              <p className="text-sm text-[var(--color-text-sub)]">Loading...</p>
            ) : (
              <ul className="space-y-2">
                {videos.map((v) => (
                  <li
                    key={v.id}
                    className="flex items-center justify-between rounded-lg border border-[var(--color-border)] p-2"
                  >
                    <span className="text-sm">
                      {v.title} ({v.video_id})
                      {v.lesson_topic && ` · ${v.lesson_topic}`}
                    </span>
                    <button
                      type="button"
                      onClick={() => remove("youtube_video", v.id)}
                      className="text-sm text-[var(--color-danger)] hover:underline"
                    >
                      Remove
                    </button>
                  </li>
                ))}
                {videos.length === 0 && (
                  <li className="text-sm text-[var(--color-text-sub)]">None yet.</li>
                )}
              </ul>
            )}
          </>
        )}

        {activeTab === "links" && (
          <>
            <h2 className="mb-3 text-lg font-medium text-[var(--color-text-main)]">
              Add educational link
            </h2>
            <form onSubmit={addLink} className="mb-6 space-y-3">
              <input
                type="url"
                placeholder="URL"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm"
                required
              />
              <input
                type="text"
                placeholder="Title"
                value={linkTitle}
                onChange={(e) => setLinkTitle(e.target.value)}
                className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm"
                required
              />
              <input
                type="text"
                placeholder="Description (optional)"
                value={linkDesc}
                onChange={(e) => setLinkDesc(e.target.value)}
                className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm"
              />
              <button
                type="submit"
                className="rounded-lg bg-[var(--color-accent)] px-4 py-2 text-sm text-white hover:brightness-110"
              >
                Add
              </button>
            </form>
            <h2 className="mb-2 text-lg font-medium text-[var(--color-text-main)]">
              Saved links
            </h2>
            {loading ? (
              <p className="text-sm text-[var(--color-text-sub)]">Loading...</p>
            ) : (
              <ul className="space-y-2">
                {links.map((l) => (
                  <li
                    key={l.id}
                    className="flex items-center justify-between rounded-lg border border-[var(--color-border)] p-2"
                  >
                    <div>
                      <a
                        href={l.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium text-[var(--color-accent)] hover:underline"
                      >
                        {l.title}
                      </a>
                      {l.description && (
                        <p className="text-xs text-[var(--color-text-sub)]">{l.description}</p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => remove("educational_link", l.id)}
                      className="text-sm text-[var(--color-danger)] hover:underline"
                    >
                      Remove
                    </button>
                  </li>
                ))}
                {links.length === 0 && (
                  <li className="text-sm text-[var(--color-text-sub)]">None yet.</li>
                )}
              </ul>
            )}
          </>
        )}
      </section>
    </div>
  );
}
