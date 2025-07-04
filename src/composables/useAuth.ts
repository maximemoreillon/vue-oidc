import { ref } from "vue";

const user = ref<any>(null);
const access_token = ref<string | null>(null);

export default function () {
  return {
    user,
    access_token,
  };
}
