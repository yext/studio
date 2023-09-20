/**
 * Renders a styled, formatted bubble with a message.
 */
export default function MessageBubble({ message }: { message: string }) {
  return (
    <div className="text-sm bg-gray-100 p-4 border text-gray-500 rounded-lg text-center mb-2">
      {message}
    </div>
  );
}
