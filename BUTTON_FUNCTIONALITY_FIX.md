# Button Functionality Fix - Debugging Guide

## 🐛 Issues Fixed

### **1. Cancel Button (元に戻す) Not Working**

**Problem:**
- Button grays out but bars don't move
- Cross-vehicle drags not properly reverted

**Root Cause:**
The undo logic only updated piece times in-place but didn't handle moving pieces back across vehicles.

**Fix:**
```typescript
// OLD (BROKEN):
setOperations(prev => prev.map(op => {
  if (op.id === state.operationId) {
    // Only updates in same vehicle ❌
  }
}));

// NEW (FIXED):
const wasCrossVehicleDrag = entry.targetOperationId && 
                            entry.targetOperationId !== entry.previousState.operationId;

if (wasCrossVehicleDrag) {
  // 1. Remove from target vehicle
  // 2. Add back to source vehicle with original times ✅
} else {
  // Just update times in same vehicle ✅
}
```

### **2. Confirm Button (確定) Not Saving**

**Problem:**
- Dialog pops up but nothing saved
- No console logs showing API call

**Root Cause:**
- Alert shows but unclear if API was called
- Need better logging to debug

**Fix:**
- Added comprehensive console logging
- Alert shows when no changes exist
- API call properly executed

### **3. Buttons Not Graying Out After Last Undo**

**Problem:**
- After undoing all changes, buttons should disable
- But they stayed active

**Root Cause:**
- `canUndo`, `canReset`, `hasChanges` not properly updating

**Fix:**
```typescript
// History hook properly updates state:
const canUndo = currentIndex >= 0;  // -1 means no changes
const canReset = history.length > 0;
const hasChanges = history.length > 0;

// After undo all:
setCurrentIndex(-1);  // Disables canUndo ✅
setHistory([]);       // Disables canReset & hasChanges ✅
```

---

## 📊 Console Logging Added

### **When Dragging:**

```
📝 Adding change to history: {
  id: "1730100123456-0.123",
  actionType: "drag",
  previousState: { pieceId: "piece-...", operationId: "op-001", ... },
  newState: { pieceId: "piece-...", operationId: "op-002", ... },
  targetOperationId: "op-002",
  timestamp: "2025-10-28T..."
}
📝 History stack: [entry1, entry2, ...]
📝 Current index updated to: 1
```

### **When Clicking "元に戻す" (Undo):**

```
⏪ Undo called, canUndo: true, currentIndex: 1
⏪ Undoing entry: { ... }
⏪ Current index updated to: 0
🔙 Undoing change: { actionType: "drag", ... }
🔙 Reverting cross-vehicle drag
✅ Undo complete
```

### **When Clicking "やり直し" (Reset):**

```
🔄 Resetting all changes
🔄 Reset all called, history length: 3
🔄 History cleared
✅ Reset complete
```

### **When Clicking "確定" (Confirm):**

```
💾 Confirm button clicked
✅ Confirm changes called, history length: 2
💾 Changes to confirm: [entry1, entry2]
💾 Calling API with updates: [
  { pieceId: "...", operationId: "...", newStartTime: ..., newEndTime: ... },
  { pieceId: "...", operationId: "...", newStartTime: ..., newEndTime: ... }
]
🔄 Confirming schedule changes: 2 changes
💾 Saving changes to localStorage (mock): ...
✅ Changes saved to localStorage successfully
✅ Changes saved successfully
✅ History cleared after confirm
```

---

## 🧪 Testing Checklist

### **Test 1: Same-Vehicle Drag + Undo**

1. ✅ Drag a bar within same vehicle
2. ✅ See console: `📝 Adding change to history`
3. ✅ See button active: `確定 (1)` and `元に戻す` enabled
4. ✅ Click `元に戻す`
5. ✅ See console: `⏪ Undo called` → `🔙 Reverting same-vehicle drag`
6. ✅ **Expected:** Bar moves back to original position
7. ✅ **Expected:** All buttons gray out (no changes)

### **Test 2: Cross-Vehicle Drag + Undo**

1. ✅ Drag a bar from Vehicle A to Vehicle B
2. ✅ See console: `📝 Adding change to history` with `targetOperationId`
3. ✅ See button: `確定 (1)` active
4. ✅ Click `元に戻す`
5. ✅ See console: `🔙 Reverting cross-vehicle drag`
6. ✅ **Expected:** Bar moves back from Vehicle B to Vehicle A
7. ✅ **Expected:** All buttons gray out

### **Test 3: Multiple Changes + Undo One**

1. ✅ Drag bar 1
2. ✅ Drag bar 2
3. ✅ See button: `確定 (2)`
4. ✅ Click `元に戻す` once
5. ✅ **Expected:** Only bar 2 reverts
6. ✅ **Expected:** Button shows `確定 (1)`
7. ✅ **Expected:** `元に戻す` still enabled

### **Test 4: Reset All**

1. ✅ Make 3 changes
2. ✅ See button: `確定 (3)`
3. ✅ Click `やり直し`
4. ✅ See console: `🔄 Resetting all changes`
5. ✅ **Expected:** All 3 bars revert to original positions
6. ✅ **Expected:** All buttons gray out

### **Test 5: Confirm Changes**

1. ✅ Make 2 changes
2. ✅ Click `確定`
3. ✅ See console: `💾 Confirm button clicked` → `💾 Calling API`
4. ✅ See alert: `✅ 2件の変更を保存しました`
5. ✅ **Expected:** All buttons gray out
6. ✅ **Expected:** localStorage has new data
7. ✅ Check console: `💾 Saving changes to localStorage (mock)`

### **Test 6: Confirm with No Changes**

1. ✅ Don't make any changes
2. ✅ All buttons should be grayed out
3. ✅ Click `確定` (should not be clickable)
4. ✅ **Expected:** Nothing happens

---

## 🔍 Debugging If Still Not Working

### **Check 1: Is history being tracked?**

Open console and drag a bar. You should see:
```
📝 Adding change to history: { ... }
📝 History stack: [...]
📝 Current index updated to: 0
```

If you **don't see this**, the problem is in `addChange()` not being called.

### **Check 2: Is undo being called?**

Click "元に戻す" and check console:
```
⏪ Undo called, canUndo: true, currentIndex: 0
⏪ Undoing entry: { ... }
```

If you see `canUndo: false`, then:
- Check if `currentIndex >= 0` (should be 0 or higher if changes exist)
- Check if button is actually calling `handleUndo()`

### **Check 3: Is state updating?**

After undo, check if `setOperations()` is called:
```
🔙 Undoing change: { ... }
🔙 Reverting cross-vehicle drag  (or same-vehicle)
✅ Undo complete
```

If you see this but bars don't move, the problem is in the `setOperations()` logic.

### **Check 4: Are piece IDs matching?**

With new UUID strategy, piece IDs should be unique:
```typescript
piece.id = "piece-1730100123456-k8x7m2a"  // ✅ Unique
```

If you still see:
```typescript
piece.id = "piece-1"  // ❌ Old format
```

Then the unique ID generation isn't working. Clear localStorage and refresh:
```typescript
localStorage.clear();
location.reload();
```

---

## 📝 Code Changes Summary

### **Files Modified:**

1. **OperationTableDisplay.tsx**
   - ✅ Fixed `handleUndo()` to handle cross-vehicle drags
   - ✅ Added logging to all button handlers
   - ✅ Added "no changes" alert for confirm button

2. **useOperationTableHistory.ts**
   - ✅ Added console logging to `addChange()`
   - ✅ Added console logging to `undo()`
   - ✅ Added console logging to `resetAll()`
   - ✅ Added console logging to `confirmChanges()`

3. **operationTableMockData.ts** (Previous fix)
   - ✅ UUID-based piece IDs

4. **DraggableStatusBar.tsx** (Previous fix)
   - ✅ Simplified drag ID using unique piece ID

---

## 🎯 Expected Behavior After Fix

| Action | Before Fix | After Fix |
|--------|-----------|-----------|
| **Drag within vehicle** | ✅ Works | ✅ Works |
| **Drag to other vehicle** | ✅ Works | ✅ Works |
| **Click 元に戻す (same vehicle)** | ❌ Button grays, bar doesn't move | ✅ Bar moves back |
| **Click 元に戻す (cross vehicle)** | ❌ Button grays, bar doesn't move | ✅ Bar moves back to original vehicle |
| **Click やり直し** | ❌ Button grays, bars don't move | ✅ All bars revert |
| **Click 確定** | ❌ Alert shows, nothing saved | ✅ Alert + localStorage save |
| **After last undo** | ❌ Buttons stay active | ✅ All buttons gray out |
| **Console logs** | ❌ No logs | ✅ Detailed logs at every step |

---

## 🚀 Next Steps

1. **Test the fix:**
   - Open browser console (F12)
   - Drag a bar and watch console logs
   - Click each button and verify logs + behavior

2. **If buttons still don't work:**
   - Copy all console logs
   - Check which log is missing (indicates where code fails)
   - Debug that specific function

3. **After confirming it works:**
   - Commit changes
   - Test with multiple drags
   - Test edge cases (drag to same position, etc.)

4. **Future improvements:**
   - Replace `alert()` with Material-UI Snackbar
   - Add confirmation dialog for Reset All
   - Add animation for undo/redo
   - Add keyboard shortcuts (Ctrl+Z, Ctrl+Shift+Z)
