import { defineConfig } from 'vite'
import typescript from '@rollup/plugin-typescript'
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js'
import * as path from 'path'

export default defineConfig(({ mode }) => {
  const name = 'canvas-editor-svg'
  if (mode === 'lib') {
    return {
      plugins: [
        cssInjectedByJsPlugin({
          styleId: `${name}-style`,
          topExecutionPriority: true
        }),
        {
          ...typescript({
            tsconfig: './tsconfig.json',
            include: ['./src/editor/**']
          }),
          apply: 'build',
          declaration: true,
          declarationDir: 'types/',
          rootDir: '/'
        }
      ],
      worker: {
        format: 'es'
      },
      build: {
        lib: {
          name,
          fileName: name,
          entry: path.resolve(__dirname, 'src/editor/index.ts'),
          formats: ['es']
        },
        rollupOptions: {
          output: {
            sourcemap: true
          }
        }
      }
    }
  }
  return {
    base: `/${name}/`,
    worker: {
      format: 'es'
    },
    server: {
      host: '0.0.0.0'
    }
  }
})
