import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { BottomNav } from "@/components/dashboard/BottomNav";
import { ConversationList } from "@/components/messages/ConversationList";
import { MessageThread } from "@/components/messages/MessageThread";
import { getCurrentUserId } from "@/lib/currentUser";
import {
  getConversationsForUser,
  getMessagesForConversation,
  getOrCreateConversation,
  type ConversationMessage,
} from "@/lib/social";

type MessagesPageProps = {
  searchParams?: {
    conversationId?: string;
    userId?: string;
  };
};

export default async function MessagesPage({ searchParams }: MessagesPageProps) {
  const currentUserId = await getCurrentUserId();

  if (!currentUserId) {
    return (
      <div className="min-h-screen bg-gray-50">
        <DashboardHeader />
        <main className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-6 pb-24 sm:px-6 lg:px-8 lg:py-8 lg:pb-8">
          <section className="rounded-2xl border border-gray-200 bg-white p-6 text-center shadow-sm">
            <h1 className="text-base font-semibold text-gray-900">
              Sign in to view your messages
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              Messaging is available for signed-in learners. Please log in and try
              again.
            </p>
          </section>
        </main>
        <BottomNav />
      </div>
    );
  }

  const initialConversationId =
    typeof searchParams?.conversationId === "string"
      ? searchParams.conversationId
      : null;

  const targetUserId =
    typeof searchParams?.userId === "string" ? searchParams.userId : null;

  let selectedConversationId = initialConversationId;

  if (!selectedConversationId && targetUserId) {
    const created = await getOrCreateConversation(currentUserId, targetUserId);
    if (created) {
      selectedConversationId = created.id;
    }
  }

  const conversations = await getConversationsForUser(currentUserId);

  let initialMessages: ConversationMessage[] = [];
  let activeOtherUsername: string | undefined;

  if (selectedConversationId) {
    initialMessages = await getMessagesForConversation(
      selectedConversationId,
      currentUserId
    );
    const activeConversation = conversations.find(
      (c) => c.id === selectedConversationId
    );
    activeOtherUsername = activeConversation?.otherUsername;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />

      <main className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-6 pb-24 sm:px-6 lg:px-8 lg:py-8 lg:pb-8">
        <section className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h1 className="text-base font-semibold text-gray-900">
              Messages
            </h1>
            <p className="text-xs text-gray-500">
              Simple threads to connect with people who share your interests.
            </p>
          </div>

          <div className="mt-2 overflow-hidden rounded-2xl border border-gray-200 bg-gray-50 shadow-sm">
            <div className="grid h-[520px] grid-cols-1 md:grid-cols-[minmax(0,0.95fr)_minmax(0,1.7fr)]">
              <ConversationList
                conversations={conversations}
                selectedId={selectedConversationId}
              />
              <MessageThread
                conversationId={selectedConversationId}
                currentUserId={currentUserId}
                otherUsername={activeOtherUsername}
                initialMessages={initialMessages}
              />
            </div>
          </div>
        </section>
      </main>
      <BottomNav />
    </div>
  );
}

