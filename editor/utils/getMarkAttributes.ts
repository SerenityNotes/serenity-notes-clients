import { EditorState } from "prosemirror-state";
import { Mark, MarkType } from "prosemirror-model";

export default function getMarkAttributes(
  state: EditorState,
  type: MarkType
): Record<string, any> {
  const { from, to, empty } = state.selection;
  let marks: Mark[] = [];

  if (empty) {
    marks = state.selection.$head.marks();
  } else {
    state.doc.nodesBetween(from, to, (node) => {
      marks = [...marks, ...node.marks];
    });
  }

  const mark = marks.find((markItem) => markItem.type.name === type.name);

  if (mark) {
    return { ...mark.attrs };
  }

  return {};
}
