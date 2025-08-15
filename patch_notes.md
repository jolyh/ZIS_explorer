# Patch logs

## 16/08/2025

### Updates 

- General code and UI improvement
- App now has an Icon, credits to: [Testing icons created by smashingstocks - Flaticon](https://www.flaticon.com/free-icons/testing)
- Added number of installed jobs beside "Show x" in table
- Copy button for Configuration content
- When no configuration is present, GET configuration returns a 404, which was counted as a general error instead of the expected return. This is now handled properly and reflected in UI.

## 28/07/2025

### Updates

- Connections Added
- Connections can be filtered
- New components and styling added

## 27/07/2025

### Updates

- Configurations Added
- Configuration can be created, updated and merged by uploading a file with the config and can be deleted
- New parameter to allow to udpate configurations
- Modal has been made more generic to fit more cases
- Design and CSS improvements (including tables, word breaking, among other things)
- Back to the top button Added
- Page is now divided in sections with navigation buttons at the top
- SVGs are now files
- You can now search for bundles (and configurations)

## 21/07/2025

### Updates

- Removal of Zendesk modal for easier handling
- New modal for the confirmation events
- Improvements on table, inner tables and preview
- HTML split into VUE CDN components
- CSS split into files matching the components
- Added installation params
- Addind a button to show if in DEBUG mode