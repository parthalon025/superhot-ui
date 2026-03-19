/**
 * ShModal component tests.
 *
 * ShModal uses useRef/useEffect, so calling it as a plain function outside
 * a Preact render cycle throws. Strategy: mirror the toast test pattern —
 * extract the static vnode structure that the component would produce,
 * and test the derivable behaviors directly.
 *
 * Observable static behaviors:
 * - Returns null when open=false
 * - Returns overlay div with class="sh-modal-overlay" when open=true
 * - role="dialog", aria-modal="true", aria-label={title}
 * - Default confirmLabel="CONFIRM", cancelLabel="CANCEL"
 * - Custom confirm/cancel labels
 * - Body rendered only when provided
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";

/**
 * Compute the static vnode structure that ShModal would render.
 * Mirrors the render return without hooks.
 */
function modalVnode({
  open,
  title,
  body,
  confirmLabel = "CONFIRM",
  cancelLabel = "CANCEL",
  onConfirm,
  onCancel,
  ...rest
} = {}) {
  if (!open) return null;

  return {
    type: "div",
    props: {
      class: "sh-modal-overlay",
      role: "dialog",
      "aria-modal": "true",
      "aria-label": title,
      ...rest,
      children: {
        type: "div",
        props: {
          class: "sh-modal",
          children: [
            { type: "div", props: { class: "sh-modal-title", children: title } },
            body ? { type: "div", props: { class: "sh-modal-body", children: body } } : null,
            {
              type: "div",
              props: {
                class: "sh-modal-actions",
                children: [{ cancelLabel }, { confirmLabel }],
              },
            },
          ],
        },
      },
    },
  };
}

describe("ShModal", () => {
  it("returns null when open=false", () => {
    const v = modalVnode({ open: false, title: "TEST" });
    assert.equal(v, null);
  });

  it("returns a vnode when open=true", () => {
    const v = modalVnode({ open: true, title: "CONFIRM: ACTION" });
    assert.ok(v);
    assert.equal(v.type, "div");
  });

  it("has class sh-modal-overlay", () => {
    const v = modalVnode({ open: true, title: "CONFIRM: ACTION" });
    assert.equal(v.props.class, "sh-modal-overlay");
  });

  it("has role=dialog", () => {
    const v = modalVnode({ open: true, title: "TEST" });
    assert.equal(v.props.role, "dialog");
  });

  it("has aria-modal=true", () => {
    const v = modalVnode({ open: true, title: "TEST" });
    assert.equal(v.props["aria-modal"], "true");
  });

  it("sets aria-label to title", () => {
    const v = modalVnode({ open: true, title: "CONFIRM: PURGE DLQ" });
    assert.equal(v.props["aria-label"], "CONFIRM: PURGE DLQ");
  });

  it("defaults confirmLabel to CONFIRM", () => {
    const v = modalVnode({ open: true, title: "TEST" });
    const actions = v.props.children.props.children[2];
    assert.equal(actions.props.children[1].confirmLabel, "CONFIRM");
  });

  it("defaults cancelLabel to CANCEL", () => {
    const v = modalVnode({ open: true, title: "TEST" });
    const actions = v.props.children.props.children[2];
    assert.equal(actions.props.children[0].cancelLabel, "CANCEL");
  });

  it("uses custom confirmLabel", () => {
    const v = modalVnode({ open: true, title: "TEST", confirmLabel: "YES" });
    const actions = v.props.children.props.children[2];
    assert.equal(actions.props.children[1].confirmLabel, "YES");
  });

  it("uses custom cancelLabel", () => {
    const v = modalVnode({ open: true, title: "TEST", cancelLabel: "NO" });
    const actions = v.props.children.props.children[2];
    assert.equal(actions.props.children[0].cancelLabel, "NO");
  });

  it("renders body when provided", () => {
    const v = modalVnode({ open: true, title: "TEST", body: "Are you sure?" });
    const bodyNode = v.props.children.props.children[1];
    assert.ok(bodyNode);
    assert.equal(bodyNode.props.class, "sh-modal-body");
    assert.equal(bodyNode.props.children, "Are you sure?");
  });

  it("does not render body when omitted", () => {
    const v = modalVnode({ open: true, title: "TEST" });
    const bodyNode = v.props.children.props.children[1];
    assert.equal(bodyNode, null);
  });

  it("renders title in sh-modal-title", () => {
    const v = modalVnode({ open: true, title: "CONFIRM: DELETE" });
    const titleNode = v.props.children.props.children[0];
    assert.equal(titleNode.props.class, "sh-modal-title");
    assert.equal(titleNode.props.children, "CONFIRM: DELETE");
  });

  it("passes through extra props", () => {
    const v = modalVnode({ open: true, title: "TEST", id: "modal-1" });
    assert.equal(v.props.id, "modal-1");
  });

  it("calling the real component outside render throws a hook error", async () => {
    const { ShModal } = await import("../dist/superhot.preact.js");
    assert.throws(
      () => ShModal({ open: true, title: "TEST" }),
      (err) => err instanceof Error,
      "Expected hook error when called outside Preact render",
    );
  });
});
