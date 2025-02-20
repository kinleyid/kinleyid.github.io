
// Ants should just be little rectangles, because the goal would be to be able to render many many of them very quickly
// The main way the user would interact with the world would be to assign tasks to groups of ants
// These tasks could be:
// 	-scout: find new food
// 	-defend: defend the anthill
//  -idle: forget current task and return to anthill
//  -forage: get food and bring it back to anthill
//  -disband: lose group identity
// Could be classes of ants that are skilled at particular tasks, as well as generalists that you start with
// What would fighting look like? They could just jiggle next to each other
// Ants with a common task would huddle together. Could pan the camera to follow a group
// Would also be fun to decide on the background. It could be procedurally generated with obstacles etc.
// It could be rendered as a static PNG at the beginning and then quickly blitted to the canvas?
// Would need some kind of system for assigning ants to groups
// Could be default groups, by class...
// Could be that you have to make sure not to over-exploit certain food sources
// Would there be some maximum radius that ants could explore? What happens when you've explored everything?
// Could have some kind of fungus agriculture system
// Ants should have a hunger meter so that they can't just go on endless tasks
// There should be elements of expansion but also intensification
