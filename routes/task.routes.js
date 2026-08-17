import {Router} from "express";
import {
    getTasks,
    updateTask,
    deleteTask,
    createTask

} from "../controllers/task.controller.js";
import {protect} from "../middleware/auth.middleware.js";

const router = Router();
router.use(protect);

router.route("/").get(getTasks).post(createTask);
router.route("/:id").put(updateTask).delete(deleteTask);

export default router;