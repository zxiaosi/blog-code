<script setup lang="ts">
import { useRouter } from "vue-router";
import { setLocal } from "@/utils/auth";

const router = useRouter();

/** 提交表单 */
const handleSubmit = () => {
  setLocal("token", "zxiaosi");
  router.push("/");
};
</script>

<template>
  <div class="page">
    <h1>登录页</h1>
    <el-button type="primary" @click="handleSubmit()">点我登录</el-button>
  </div>
</template>

<style scoped lang="less">
.page {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  align-items: center;
  flex-direction: column;
}
</style>
