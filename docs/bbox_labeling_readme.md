# How to use bbox labeling tool

## Preparing images
copy images to annotate in `static/bbox_labeling/images`. Please make sure that only images files exist in this directory. This is all that is required to start using bbox labeling tool.

Also, please make sure that when images are changed in the `static/bbox_labeling/images`, the server must be restarted in order to recognize the changes. Therefore, after copying the image files, please restart the server.

## Tool UI
- `stats` button: toggles on/off a popover that shows a simple stat of the bounding boxes for the current image.
- `save` button: manual save button. Will save the current image's annotation progress in the server.
- `Menu - convert`: will convert the saved annotations to json files that include only necessary information to be used as a part of a dataset annotation. When the conversion is complete, it will show an alert dialog informing the path where the conversion results are saved.

- pressing `s` key: save current image's progress. same effect as `save` button.
- when save is triggered, it will show `saving...` in the lower part of the screen. When saving is done successfully, it will show `saving complete` and if failed, it will show `saving failed`. This status message will disappear after 3 seconds.
- after selecting a box and pressing `delete` key will remove the selected box. Only one box can be selected at a time.
- can draw a bounding box by pressing and dragging the mouse pointer inside the image.
- can zoom in/out image for easier bounding box drawing.
- if the drawn bounding box is too small, it will be ignored. Therefore, zoom in appropriately for proper drawing.
- when a box is drawn, labeling popup will automatically appear and the focus will be automatically set to the textinput area. Please write the class of the drawn box.
- Once the class has been populated in the labeling popup, user can either press `Enter` or click somewhere else. Both methods will automatically save the class value to the drawn box.
