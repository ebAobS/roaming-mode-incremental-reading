import os
import zipfile

import scriptutils

if __name__ == "__main__":
    # 切换工作空间
    scriptutils.switch_workdir()

    # 获取当前工作空间
    cwd = scriptutils.get_workdir()

    dist_folder = "./dist"
    data = scriptutils.read_json_file(cwd + "package.json")
    v = data["version"]

    build_zip_path = "./build"
    build_zip_name = "roaming-mode-incremental-reading-" + v + ".zip"
    build_zip_full = os.path.join(build_zip_path, build_zip_name)

    try:
        # 生成 zip 时直接以 dist 内容为根，避免额外目录包裹
        scriptutils.mkdir(build_zip_path)
        scriptutils.rm_file(build_zip_full)

        with zipfile.ZipFile(build_zip_full, "w", compression=zipfile.ZIP_STORED) as zf:
            for root, _, files in os.walk(dist_folder):
                for file in files:
                    file_path = os.path.join(root, file)
                    arcname = os.path.relpath(file_path, dist_folder)
                    zf.write(file_path, arcname)

        scriptutils.cp_file(build_zip_full, os.path.join(build_zip_path, "package.zip"))
    except Exception as e:
        print(f"打包错误,{str(e)}")
    print("插件打包完毕.")
