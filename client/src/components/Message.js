// Green success / pink error banner. role="status" lets screen readers announce it.
const Message = ({ message, onClose }) => {
  if (!message) return null;
  return <div role="status" className={`message message-${message.type}`}>
    <span>{message.text}</span>
    {onClose && <button onClick={onClose} aria-label="Dismiss message">✕</button>}
  </div>;
};

export default Message;
