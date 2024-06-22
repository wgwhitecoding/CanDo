-- Table structure for `user_profile`
CREATE TABLE "user_profile" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "user_id" INTEGER NOT NULL,
    "phone_number" VARCHAR(20) NULL,
    "address" VARCHAR(255) NULL,
    FOREIGN KEY("user_id") REFERENCES "auth_user"("id")
);

-- Table structure for `category`
CREATE TABLE "category" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT NULL
);

-- Table structure for `project`
CREATE TABLE "project" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT NULL,
    "owner_id" INTEGER NOT NULL,
    FOREIGN KEY("owner_id") REFERENCES "auth_user"("id")
);

-- Table structure for `kanban_task`
CREATE TABLE "kanban_task" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "user_id" INTEGER NOT NULL,
    "category_id" INTEGER NULL,
    "project_id" INTEGER NULL,
    "title" VARCHAR(100) NOT NULL,
    "description" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL,
    "due_date" DATETIME NULL,
    "priority" VARCHAR(10) NULL,
    "completed" BOOLEAN NOT NULL,
    "recurring_interval" VARCHAR(50) NULL,
    "stage" VARCHAR(50) NULL,  -- Added stage field
    FOREIGN KEY("user_id") REFERENCES "auth_user"("id"),
    FOREIGN KEY("category_id") REFERENCES "category"("id"),
    FOREIGN KEY("project_id") REFERENCES "project"("id")
);

-- Table structure for `tag`
CREATE TABLE "tag" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" VARCHAR(50) NOT NULL
);

-- Table structure for `kanban_task_tags`
CREATE TABLE "kanban_task_tags" (
    "kanban_task_id" INTEGER NOT NULL,
    "tag_id" INTEGER NOT NULL,
    PRIMARY KEY ("kanban_task_id", "tag_id"),
    FOREIGN KEY("kanban_task_id") REFERENCES "kanban_task"("id"),
    FOREIGN KEY("tag_id") REFERENCES "tag"("id")
);

-- Table structure for `attachment`
CREATE TABLE "attachment" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "kanban_task_id" INTEGER NOT NULL,
    "file_path" VARCHAR(255) NOT NULL,
    FOREIGN KEY("kanban_task_id") REFERENCES "kanban_task"("id")
);

-- Table structure for `subtask`
CREATE TABLE "subtask" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "kanban_task_id" INTEGER NOT NULL,
    "title" VARCHAR(100) NOT NULL,
    "description" TEXT NOT NULL,
    "completed" BOOLEAN NOT NULL,
    FOREIGN KEY("kanban_task_id") REFERENCES "kanban_task"("id")
);

-- Table structure for `notification`
CREATE TABLE "notification" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "user_id" INTEGER NOT NULL,
    "message" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL,
    "created_at" DATETIME NOT NULL,
    FOREIGN KEY("user_id") REFERENCES "auth_user"("id")
);

-- Table structure for `comment`
CREATE TABLE "comment" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "kanban_task_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "comment_text" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL,
    FOREIGN KEY("kanban_task_id") REFERENCES "kanban_task"("id"),
    FOREIGN KEY("user_id") REFERENCES "auth_user"("id")
);

-- Table structure for `reminder`
CREATE TABLE "reminder" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "kanban_task_id" INTEGER NOT NULL,
    "reminder_time" DATETIME NOT NULL,
    FOREIGN KEY("kanban_task_id") REFERENCES "kanban_task"("id")
);

-- Table structure for `activity_log`
CREATE TABLE "activity_log" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "kanban_task_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "activity" TEXT NOT NULL,
    "timestamp" DATETIME NOT NULL,
    FOREIGN KEY("kanban_task_id") REFERENCES "kanban_task"("id"),
    FOREIGN KEY("user_id") REFERENCES "auth_user"("id")
);

-- Table structure for `collaborator`
CREATE TABLE "collaborator" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "kanban_task_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    FOREIGN KEY("kanban_task_id") REFERENCES "kanban_task"("id"),
    FOREIGN KEY("user_id") REFERENCES "auth_user"("id")
);

-- Table structure for `shared_list`
CREATE TABLE "shared_list" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "list_name" VARCHAR(100) NOT NULL,
    "owner_id" INTEGER NOT NULL,
    FOREIGN KEY("owner_id") REFERENCES "auth_user"("id")
);

-- Table structure for `shared_list_kanban_tasks`
CREATE TABLE "shared_list_kanban_tasks" (
    "shared_list_id" INTEGER NOT NULL,
    "kanban_task_id" INTEGER NOT NULL,
    PRIMARY KEY ("shared_list_id", "kanban_task_id"),
    FOREIGN KEY("shared_list_id") REFERENCES "shared_list"("id"),
    FOREIGN KEY("kanban_task_id") REFERENCES "kanban_task"("id")
);

-- Table structure for `user_preference`
CREATE TABLE "user_preference" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "user_id" INTEGER NOT NULL,
    "preference_key" VARCHAR(100) NOT NULL,
    "preference_value" VARCHAR(255) NOT NULL,
    FOREIGN KEY("user_id") REFERENCES "auth_user"("id")
);

-- Table structure for `user_theme`
CREATE TABLE "user_theme" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "user_id" INTEGER NOT NULL,
    "theme_name" VARCHAR(100) NOT NULL,
    "primary_color" VARCHAR(7) NOT NULL,
    "secondary_color" VARCHAR(7) NOT NULL,
    FOREIGN KEY("user_id") REFERENCES "auth_user"("id")
);

-- Table structure for `note`
CREATE TABLE "note" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "user_id" INTEGER NOT NULL,
    "kanban_task_id" INTEGER NULL,
    "title" VARCHAR(100) NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL,
    FOREIGN KEY("user_id") REFERENCES "auth_user"("id"),
    FOREIGN KEY("kanban_task_id") REFERENCES "kanban_task"("id")
);