
## How to use Segmentation Labeing tool

### navigation

- With `PageUp` and `PageDown` key user can navigate through the image to label. When navigating with this method, labeling progress will be saved automatically.
- The user can navigate through images with the slidebar on the top as well. When navigating with this method, labeling progress will **NOT** be saved automatically.
- Left and Right navigation buttons are available for mobile devices.
- On the top-right, there is a slide bar where the user can navigate to a specific point at once
- For fine navigation, the user can insert a valid index number in the textbox to move to a specific image at once.


### draw & edit
- draw the area by pushing mouse down, dragging around the area, and releasing the mouse click.
- user can select the area by clicking on the edge of a path.
- once a path is selected, it can be deleted by pressing the `delete` button
- multiple paths can be selected simultaneously
- on the top, there are three buttons for editing paths. These are implemented for mobile devices.
- user can save the current image's labeling progress manually by pressing `s` button.
- on the bottom, there is a manual save button for mobile devices. manually triggering save is useful when the user has finished labeling the last image.

### converting
- When labeling is all done and the user is ready to convert all the labeling data into actual masked `.png` files, click the `convert` button on bottom-left of the screen.
- If labeling is not done for all images, or some labels are empty, then an alert message will appear.
- If labeling is done without any problems, then the conversion of label saves to png files will start. The screen will show the progress.
- Once the conversion is done, the progress screen will disappear automatically.
- After the convserion is done, please check the converted png files under the `/static/output` directory.
