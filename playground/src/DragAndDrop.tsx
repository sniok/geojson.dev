import * as React from "react";

export function DragAndDrop({
  onFileContent
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
        if (file.type === "application/json") {
          (file as any).text().then((content: any) => {
            onFileContent(content);
          });
        }

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

  //   if (!isDragging) {
  //     return null;
  //   }

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
        zIndex: 99999
      }}
    >
      Release to upload
    </div>
  );
}

// class DragAndDrop2 extends Component {
//   constructor(props) {
//     super(props);
//     this.state = {
//       drag: false
//     };

//     this.dragCounter = 0;
//   }

//   handleDrag(event) {
//     event.preventDefault();
//     event.stopPropagation();
//   }

//   handleDragIn(event) {
//     event.preventDefault();
//     event.stopPropagation();

//     this.dragCounter++;

//     if (event.dataTransfer.items && event.dataTransfer.items.length > 0) {
//       this.setState({ drag: true });
//     }
//   }

//   handleDragOut(event) {
//     event.preventDefault();
//     event.stopPropagation();

//     this.dragCounter--;

//     if (this.dragCounter === 0) {
//       this.setState({ drag: false });
//     }
//   }

//   handleDrop(event) {
//     event.preventDefault();
//     event.stopPropagation();

//     this.setState({ drag: false });

//     if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
//       this.props.handleDrop(event.dataTransfer.files);
//       event.dataTransfer.clearData();
//       this.dragCounter = 0;
//     }
//   }

//   componentDidMount() {
//     let el = document.body;
//     el.addEventListener("dragenter", event => this.handleDragIn(event));
//     el.addEventListener("dragleave", event => this.handleDragOut(event));
//     el.addEventListener("dragover", event => this.handleDrag(event));
//     el.addEventListener("drop", event => this.handleDrop(event));
//   }

//   componentWillUnmount() {
//     let el = document.body;
//     el.removeEventListener("dragenter", event => this.handleDragIn(event));
//     el.removeEventListener("dragleave", event => this.handleDragOut(event));
//     el.removeEventListener("dragover", event => this.handleDrag(event));
//     el.removeEventListener("drop", event => this.handleDrop(event));
//   }

//   render() {
//     return (
//       <div
//         style={{
//           position: "fixed",
//           top: 0,
//           left: 0,
//           width: "100%",
//           height: "100%",
//           display: "flex",
//           pointerEvents: "none",
//           justifyContent: "center",
//           alignItems: "center",
//           border: "5px solid red"
//         }}
//       >
//         {this.state.drag && (
//           <div
//             style={{
//               position: "fixed",
//               top: 0,
//               left: 0,
//               width: "100%",
//               height: "100%",
//               display: "flex",
//               justifyContent: "center",
//               alignItems: "center",
//               fontSize: "5em",
//               color: "#000",
//               border: "5px solid green"
//             }}
//           >
//             Drop here
//           </div>
//         )}
//         {this.props.children}
//       </div>
//     );
//   }
// }
// export default DragAndDrop;
