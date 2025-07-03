const Toast = ({ message, type = "success", duration = 3000, onClose }) => {
  const [visible, setVisible] = useState(true);

  useState(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div className={`alert alert-${type} w-full mb-6`}>
      <span>{message}</span>
    </div>
  );
};