import { ref, watch } from 'vue';
import useStorage from '@/use/storage';

const { getValue, setValue } = useStorage();
const prefersDarkMode = ref(false);

watch(prefersDarkMode, async (value) => {
  await setValue('darkMode', value);
  document.body.classList.toggle('dark', value);
});

const load = async () => {
  prefersDarkMode.value = !!(await getValue('darkMode'));
};

export default () => ({
  load,
  prefersDarkMode,
});
