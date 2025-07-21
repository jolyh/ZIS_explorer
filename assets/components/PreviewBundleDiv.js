export default {
    props: ['bundle_content', 'is_preview_expanded'],
    emits: ['toggle_preview_expansion', 'copy_to_clipboard', 'update_shown_bundle_id'],
    setup(props, ctx) {

        console.log('PreviewBundleDiv setup', props);
        // In progress 
        const copy_button_clicked = () => {
            ctx.emit('copy_to_clipboard', props.bundle_content);
        }

        const expend_button_clicked = () => {
            ctx.emit('toggle_preview_expansion');
        }

        const close_preview = () => {
            ctx.emit('update_shown_bundle_id');
        }

        return { copy_button_clicked, expend_button_clicked, close_preview }
    },
    template: `
    <div>
        <pre>{{ bundle_content }}</pre>

        <button @click="expend_button_clicked" class="icon_btn expand_btn" title="Expand/Collapse preview">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
            stroke-linecap="round" stroke-linejoin="round"
            :style="{transform: is_preview_expanded ? 'rotate(180deg)' : 'rotate(0deg)'}">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>

        <button @click="copy_button_clicked"
          class="icon_btn copy_btn" title="Copy to clipboard">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
            stroke-linecap="round" stroke-linejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
          </svg>
        </button>

        <button @click="close_preview" class="icon_btn close_btn" title="Close preview">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
            stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
    </div>
    `
}