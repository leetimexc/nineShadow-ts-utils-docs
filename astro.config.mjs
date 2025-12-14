// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

const isProd = process.env.NODE_ENV === 'production'

// https://astro.build/config
export default defineConfig({
  outDir: './nineshadow-utils',
  base: isProd ? '/nineshadow-utils/' : '/', // 本地'/'，生产'/nineshadow-utils/'
	integrations: [
		starlight({
			title: '@nineshadow/http-utils',
			description: '九影科技 HTTP 工具库 - 统一身份认证、文件上传、用户管理、长连接等功能封装',
			customCss: ['./src/styles/custom.css'],
			// social: [
			// 	{ icon: 'github', label: 'GitHub', href: 'https://github.com/nine-shadow/ns-http-utils' }
			// ],
			sidebar: [
				{
					label: '开始使用',
					items: [
						{ label: '简介', slug: 'index' },
						{ label: '快速开始', slug: 'getting-started/quick-start' },
						{ label: '安装配置', slug: 'getting-started/installation' },
					],
				},
				{
					label: '核心功能',
					items: [
						{ label: '配置管理', slug: 'core/config' },
						{ label: 'HTTP 请求', slug: 'core/http' },
					],
				},
				{
					label: '业务模块',
					items: [
						{ label: 'IAM 身份认证', slug: 'modules/iam' },
						{ label: '文件上传', slug: 'modules/upload' },
						{ label: '用户管理', slug: 'modules/user' },
						{ label: 'WebSocket 长连接', slug: 'modules/websocket' },
					],
				},
				{
					label: '框架集成',
					items: [
						{ label: 'Vue 集成', slug: 'integration/vue' },
						{ label: 'React 集成', slug: 'integration/react' },
					],
				},
				{
					label: 'API 参考',
					autogenerate: { directory: 'api' },
				},
			],
		}),
	]
});
