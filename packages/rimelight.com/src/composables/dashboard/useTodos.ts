import { ref } from "vue";
import { actions } from "astro:actions";

const todoRefreshTrigger = ref(0);
const status = ref<"idle" | "loading" | "success" | "error">("idle");
const error = ref<Error | null>(null);

export const useTodos = () => {
  const triggerRefresh = () => {
    todoRefreshTrigger.value++;
  };

  const wrapApi = async (fn: () => Promise<any>) => {
    status.value = "loading";
    error.value = null;
    try {
      await fn();
      status.value = "success";
      triggerRefresh();
    } catch (e) {
      status.value = "error";
      error.value = e instanceof Error ? e : new Error(String(e));
    }
  };

  const toggleTodo = async (id: string, completed: boolean) => {
    await wrapApi(async () => {
      const { error: err } = await actions.todos.updateTodo({
        id,
        completed,
        completedAt: completed ? new Date().toISOString() : null
      });
      if (err) throw new Error(err.message);
    });
  };

  const archiveTodo = async (id: string) => {
    await wrapApi(async () => {
      const { error: err } = await actions.todos.updateTodo({ id, isArchived: true });
      if (err) throw new Error(err.message);
    });
  };

  const restoreTodo = async (id: string) => {
    await wrapApi(async () => {
      const { error: err } = await actions.todos.updateTodo({ id, isArchived: false });
      if (err) throw new Error(err.message);
    });
  };

  const deleteTodo = async (id: string) => {
    await wrapApi(async () => {
      const { error: err } = await actions.todos.deleteTodo({ id });
      if (err) throw new Error(err.message);
    });
  };

  const createTodo = async (title: string, description?: string) => {
    await wrapApi(async () => {
      const { error: err } = await actions.todos.createTodo({ title, description });
      if (err) throw new Error(err.message);
    });
  };

  const clearCompleted = async () => {
    await wrapApi(async () => {
      const { error: err } = await actions.todos.clearCompleted();
      if (err) throw new Error(err.message);
    });
  };

  return {
    todoRefreshTrigger,
    status,
    error,
    triggerRefresh,
    toggleTodo,
    archiveTodo,
    restoreTodo,
    deleteTodo,
    createTodo,
    clearCompleted,
  };
};
