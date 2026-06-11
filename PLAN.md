# Fallback Response Card UI/UX

## Summary
This state should feel reassuring, useful, and low-friction. Right now the structure is close, but the message feels a little blunt and the action card is visually heavier than the answer itself. The ideal version should make the user feel: “No exact answer was found, but I still have clear next steps.”

## Recommended Look
- Keep the assistant answer inside a soft elevated card with a very light gray or warm-white background, subtle border, and generous padding.
- Make the assistant label smaller and quieter; it should support the content, not compete with it.
- Use friendlier fallback copy such as: `I couldn’t find a reliable answer to that on the website yet. You can try a related question or contact our team for help.`
- Keep the company avatar and timestamp, but reduce their visual weight slightly so the answer becomes the focus.
- Keep the “Next steps” section as a separate card, but make it lighter and tighter. Right now it looks slightly oversized for the amount of content.

## CTA Hierarchy
- `Contact Us` should stay primary, but not overly aggressive. Use a filled brand button with slightly softer saturation and a stronger shadow/border balance.
- `Explore related questions` should be secondary and clearly look like an in-chat action, not another equal-priority conversion button.
- Add one short helper line above the buttons:
  `Need help from our team or want to keep exploring?`
- If related questions exist, show 2-3 suggested question chips directly below the secondary CTA instead of hiding too much behind another click.

## UX Behavior
- For fallback answers, auto-show related suggestions immediately if they are available.
- If no related questions exist, replace the secondary action with something more useful like `Ask in a different way`.
- Keep the card compact; this state should resolve uncertainty fast, not create another large panel.
- On mobile, stack buttons full width with consistent 44px+ tap height and tighter vertical spacing.

## Visual Direction
- Answer card:
  soft surface, medium-large radius, subtle border, comfortable line-height.
- Next steps card:
  slightly stronger border than the answer card, but less height and padding than the current mockup.
- Typography:
  sentence case, cleaner spacing, darker body text, more muted section labels.
- Color:
  brand orange only for the true primary action; everything else should stay neutral slate/gray.

## Test Cases
- Fallback with related questions available.
- Fallback with no related questions available.
- Long fallback message wrapping across 2-3 lines.
- Mobile layout with full-width actions.
- Keyboard focus states on both CTAs and any suggestion chips.

## Assumptions
- This is the “no reliable website answer found” state, not a system error state.
- The goal is balanced: keep one human-contact path and one self-serve path.
- No backend change is required unless you want smarter fallback suggestions.

