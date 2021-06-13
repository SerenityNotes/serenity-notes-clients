import React from "react";
import { EditorView } from "prosemirror-view";
import { IconType } from "react-icons/lib";
import { classNames } from "./classnames";

type Props = {
  editorView: EditorView;
  icon: IconType;
  title: string;
  command: any;
};

export default function CommandButton({
  editorView,
  icon,
  title,
  command,
}: Props) {
  const Icon = icon;
  const canDoCommand = command(editorView.state);

  const cx = classNames("ToolbarIcon", canDoCommand && "enabled");

  return (
    <button
      title={title}
      onMouseDown={(evt) => {
        evt.preventDefault();
        command(editorView.state, editorView.dispatch);
      }}
      style={{
        border: "0 solid transparent",
        fontSize: 24,
        borderRadius: 4,
        padding: "0rem 0.3rem 0.2rem",
        marginRight: "0.1rem",
      }}
      className={cx}
    >
      <Icon
        style={{
          display: "inline-block",
          verticalAlign: "middle",
        }}
      />
    </button>
  );
}
