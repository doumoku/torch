---
name: Bug report
about: Create a report to help us improve
title: ''
labels: ''
assignees: ''

---

Including the following data in the ticket will make it much easier to reproduce, identify, and correct a bug. (Otherwise, we'll probably be asking for it later.)

**Describe the bug**
A clear and concise description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

**Expected behavior**
A clear and concise description of what you expected to happen.

**Environment**
- FoundryVTT version
- Torch module version
- System name and version

** Attachments **
- Actor whose token is exhibiting the issue.
- The "additional light sources" JSON (if any) that you are using.
- If there is a console log error when the problem occurs, a screenshot of the error as it appears in the console log.
- Any screenshots that help explain the issue.

** Other details that are often useful
- Whether the token is linked to the actor

** Things it helps to know are considered normal operation:
- Torch uses the light settings of the token, not a separate light source, so you can only set the light properties applicable to the token itself.
- When you turn off the light source, Torch restores the light settings of the token to the light settings of the prototype token of the actor.
- If you save a token to the prototype and you have a light source turned on, those light settings will be saved to the prototype token as well and it will appear as if you can't turn the light off.
- The additional light settings files are re-read every time you open the token HUD.
- Light sources are matched by name and the built-in light sources are matching to the names of the light sources as published by the system in the original language. To work with translations, you may need to supply an additional light sources JSON or YAML identifying aliases for the original ones.
