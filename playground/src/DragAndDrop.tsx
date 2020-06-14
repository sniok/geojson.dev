import * as React from "react";

export function DragAndDrop({
  onFileContent,
}: {
  onFileContent: (content: string) => any;
}) {
  const [isDragging, setIsDragging] = React.useState(false);
  const dragCounter = React.useRef(0);

  React.useEffect(() => {
    const trigger = document.body;

    const onEnter = (e: DragEvent) => {
      dragCounter.current++;
      e.preventDefault();
      e.stopPropagation();
      if (
        e.dataTransfer !== null &&
        e.dataTransfer.items &&
        e.dataTransfer.items.length > 0
      ) {
        setIsDragging(true);
      }
    };

    const onLeave = (e: DragEvent) => {
      dragCounter.current--;
      e.preventDefault();
      e.stopPropagation();
      if (dragCounter.current === 0) {
        setIsDragging(false);
      }
    };

    const onDrop = (event: DragEvent) => {
      dragCounter.current = 0;
      setIsDragging(false);
      event.stopPropagation();
      event.preventDefault();

      if (event.dataTransfer === null) {
        return;
      }

      if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
        const file = event.dataTransfer.files[0];

        (file as any).text().then((content: any) => {
          onFileContent(content);
        });

        event.dataTransfer.clearData();
      }
    };

    const onOver = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
    };

    trigger.addEventListener("dragenter", onEnter);
    trigger.addEventListener("dragleave", onLeave);
    trigger.addEventListener("dragover", onOver);
    trigger.addEventListener("drop", onDrop);

    return () => {
      trigger.removeEventListener("dragenter", onEnter);
      trigger.removeEventListener("dragover", onOver);
      trigger.removeEventListener("dragleave", onLeave);
      trigger.removeEventListener("drop", onDrop);
    };
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        color: "#FFF",
        opacity: isDragging ? 1 : 0,
        background: "rgba(0,0,0,0.1)",
        backdropFilter: isDragging ? "blur(4px)" : "",
        transitionDuration: "0.3s",
        width: "100%",
        height: "100%",
        display: "flex",
        pointerEvents: "none",
        justifyContent: "center",
        alignItems: "center",
        fontWeight: "bold",
        fontSize: "24px",
        zIndex: 99999,
      }}
    >
      Release to upload
    </div>
  );
}
