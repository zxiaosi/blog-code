<script setup lang="ts">
import { useRouter } from "vue-router";
import { clearLocal, getLocal } from "@/utils/auth";
import { iterateMenu } from "@/router";

const router = useRouter();
const menus = iterateMenu(getLocal("menus")) || []; // 这里可以使用状态管理

/** 退出登录 */
const handleLogout = async () => {
  clearLocal();
  router.push("/login");
};
</script>

<template>
  <el-container class="pages">
    <el-aside>
      <div class="logo">Demo</div>

      <el-menu router unique-opened background-color="#324157" text-color="#FFFFFF" active-text-color="#409EFF" :collapse-transition="false" :default-active="router.currentRoute.value.path">
        <template v-for="item in menus">
          <!-- 二级菜单 -->
          <template v-if="item.children?.length > 0">
            <el-sub-menu :index="item.path">
              <template #title>
                <component class="icon" :is="item.meta.icon" />
                <span>{{ item.meta?.title }}</span>
              </template>

              <template v-for="subItem in item.children">
                <el-menu-item :index="subItem.path">
                  <component class="icon" :is="item.meta.icon" />
                  <template #title>{{ subItem.meta?.title }}</template>
                </el-menu-item>
              </template>
            </el-sub-menu>
          </template>

          <!-- 一级菜单 -->
          <template v-else>
            <el-menu-item :index="item.path">
              <component class="icon" :is="item.meta.icon" />
              <template #title>{{ item.meta?.title }}</template>
            </el-menu-item>
          </template>
        </template>
      </el-menu>
    </el-aside>

    <el-container>
      <el-header>
        <el-button type="primary" @click="handleLogout">退出登录</el-button>
      </el-header>

      <el-container class="content">
        <el-main>
          <router-view />
        </el-main>
      </el-container>
    </el-container>
  </el-container>
</template>

<style scoped lang="less">
.pages {
  min-width: auto;

  .el-aside {
    width: 200px;
    min-width: 200px;
    height: 100vh;
    background-color: #324157;
    color: #ffffff;

    .logo {
      height: 60px;
      line-height: 60px;
      text-align: center;
      font-size: 24px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .el-menu {
      border-right: none;

      .el-sub-menu,
      .el-menu-item {
        .el-image {
          width: 20px;
          height: 20px;
          background-color: #adb9c9;
          margin-right: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
      }

      .icon {
        width: 20px;
        height: 20px;
        margin-right: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
    }
  }

  .el-header {
    position: relative;
    color: #ffffff;
    background-color: #242f42;
    padding: 10px 20px;
    display: flex;
    justify-content: flex-end;
    align-items: center;

    .content {
      padding: 0;
      background-color: #f0f0f0;
      overflow-y: auto;
      max-height: calc(100vh - 60px);

      .el-main {
        height: max-content;
        background: #fff;
        border-radius: 5px;
        border: 1px solid #ddd;
        margin: 20px;
      }
    }
  }
}
</style>
