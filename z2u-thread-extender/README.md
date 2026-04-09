# Z2U Batch Sort

A Chrome extension that runs **Batch Sort only** on Z2U.com manage list page.

## Features
- **Batch Sort only**: On the `manageList` page, selects all products and clicks "Batch sort" (every 30s when on the page, or via Satellite worker).
- **Satellite mode**: Launch a mini worker window that runs Batch Sort and auto-closes; repeats on an interval.
- **Log dashboard**: Extension popup shows a log of Batch Sort actions.
- **Admin sync**: Optional password to sync activity to OfficialUM1 Admin Panel.

## Install
1. Open Chrome → `chrome://extensions/`.
2. Enable **Developer mode**.
3. Click **Load unpacked** and select the `z2u-thread-extender` folder.
4. Pin the extension (optional).
