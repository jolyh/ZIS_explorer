export default {
    props: ['bundle_content', 'is_preview_expanded'],
    emits: ['toggle_preview_expansion', 'copy_to_clipboard', 'update_shown_bundle_id'],
    setup(props, ctx) {

        //console.log('PreviewBundleDiv setup', props);
        const copy_button_clicked = () => {
            ctx.emit('copy_to_clipboard', props.bundle_content);
        }

        const expand_button_clicked = () => {
            ctx.emit('toggle_preview_expansion');
        }

        const close_preview = () => {
            ctx.emit('update_shown_bundle_id');
        }

        return { copy_button_clicked, expand_button_clicked, close_preview }
    },
    template: `
    <div>
      <button @click="expand_button_clicked" title="Expand/Collapse preview">
        <svg :style="{transform: is_preview_expanded ? 'rotate(180deg)' : 'rotate(0deg)'}">
          <use xlink:href="./icons/arrow_left.svg#arrow_left_icon"></use>
        </svg>
      </button>

      <button @click="copy_button_clicked" class="copy-btn" title="Copy to clipboard">
        <svg>
          <use xlink:href="./icons/copy.svg#copy_icon"></use>
        </svg>
      </button>

      <button @click="close_preview" class="close_btn" title="Close preview">
        <svg>
          <use xlink:href="./icons/cancel.svg#cancel_icon"></use>
        </svg>
      </button>
      <pre>{{ bundle_content }}</pre>
    </div>
    `
}