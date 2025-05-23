#  Copyright (c) 2022-2025, ebAobS . All rights reserved.
#  @author ebAobS on 2025/05/06

import json
import os
import sys
import urllib.parse
import urllib.request

import scriptutils

# ************************************ 在这里填写你的配置 ************************************
# 请在这里写下你的 "workspace/data/plugins" 目录
# 比如这样 targetDir = 'H:\\SiYuanDevSpace\\data\\plugins'
targetDir = ''
# dev 构建输出目录，相对于项目根路径
devOutDir = 'dist'
# ******************************************************************************************

POST_HEADER = {
    "Authorization": f"Token ",
    "Content-Type": "application/json",
}


def get_siyuan_dir():
    url = 'http://127.0.0.1:6806/api/system/getWorkspaces'
    try:
        response = _myfetch(url, {
            'method': 'POST',
            'headers': POST_HEADER
        })
        if response['ok'] and 200 <= response['status'] < 300:
            data = response['data']
            conf = json.loads(data)
        else:
            _error(f'\tget_siyuan_dir HTTP-Error: {response["status"]}')
            return None
    except Exception as e:
        _error(f'\tError: {e}')
        _error('\tPlease make sure SiYuan is running!!!')
        return None
    return conf['data']


def choose_target(workspaces):
    count = len(workspaces)
    _log(f'>>> Got {count} SiYuan {"workspaces" if count > 1 else "workspace"}')
    for i, workspace in enumerate(workspaces):
        _log(f'\t[{i}] {workspace["path"]}')

    if count == 1:
        return f'{workspaces[0]["path"]}/data/plugins'
    else:
        index = input(f'\tPlease select a workspace[0-{count - 1}]: ')
        return f'{workspaces[int(index)]["path"]}/data/plugins'


def get_plugin_name():
    # 检查 plugin.json 是否存在
    if not os.path.exists('./plugin.json'):
        _error('失败！找不到 plugin.json')
        sys.exit(1)
    # 获取插件名称
    # 加载 plugin.json
    with open('./plugin.json', 'r') as file:
        plugin = json.load(file)
    plugin_name = plugin.get('name')
    if not plugin_name or plugin_name == '':
        _error('失败！请在 plugin.json 中设置插件名称')
        sys.exit(1)
    return plugin_name


def make_link(target_dir, plugin_name):
    # dev 目录
    dev_dir = f'{os.getcwd()}/{devOutDir}'
    # 如果不存在则创建
    if not os.path.exists(dev_dir):
        os.makedirs(dev_dir)

    target_path = f'{target_dir}/{plugin_name}'
    # 如果已存在，则退出
    if os.path.exists(target_path):
        is_symbol = os.path.islink(target_path)

        if is_symbol:
            src_path = os.readlink(target_path)

            if _cmp_path(src_path, dev_dir):
                _log(f'Good! {target_path} 已经链接到 {dev_dir}')
            else:
                _error(f'Error! 符号链接 {target_path} 已存在\n但它链接到了 {src_path}')
        else:
            _error(f'失败！{target_path} 已经存在并且不是符号链接')

    else:
        # 创建符号链接
        os.symlink(dev_dir, target_path, target_is_directory=True)
        _log(f'Done! 创建符号链接 {target_path}')


# =====================
# private methods
# =====================
def _log(info):
    print(f'\033[36m{info}\033[0m')


def _error(info):
    print(f'\033[31m{info}\033[0m')


def _myfetch(url, options):
    method = options['method'].upper()
    headers = options['headers']

    if method == 'GET':
        query_params = options.get('params', {})
        query_string = urllib.parse.urlencode(query_params)
        full_url = f"{url}?{query_string}"
        req = urllib.request.Request(full_url, headers=headers)
    elif method == 'POST':
        data = options.get('data', {})
        encoded_data = urllib.parse.urlencode(data).encode('utf-8')
        req = urllib.request.Request(url, data=encoded_data, headers=headers)
    else:
        raise ValueError(f"Unsupported method: {method}")

    with urllib.request.urlopen(req) as response:
        data = response.read().decode('utf-8')
        status = response.status

    return {
        'ok': True,
        'status': status,
        'data': data
    }


def _cmp_path(path1, path2):
    path1 = path1.replace('\\', '/')
    path2 = path2.replace('\\', '/')
    # 尾部添加分隔符
    if path1[-1] != '/':
        path1 += '/'
    if path2[-1] != '/':
        path2 += '/'
    return path1 == path2


if __name__ == "__main__":
    # 切换工作空间
    scriptutils.switch_workdir()

    # 获取当前路径
    cwd = scriptutils.get_workdir()

    # 获取插件目录
    _log('>>> 尝试访问 make_dev_link.js 中的常量 "targetDir"...')
    if targetDir == '':
        _log('>>> 常量 "targetDir" 为空，尝试自动获取 SiYuan 目录...')
        res = get_siyuan_dir()
        if res is None or len(res) == 0:
            _log('>>> 无法自动获取 SiYuan 目录，尝试访问环境变量 "SIYUAN_PLUGIN_DIR"...')

            env = os.getenv('SIYUAN_PLUGIN_DIR')
            if env is not None and env != '':
                targetDir = env
                _log(f'\t从环境变量 "SIYUAN_PLUGIN_DIR" 获取到目标目录: {targetDir}')
            else:
                _error('\t无法从环境变量 "SIYUAN_PLUGIN_DIR" 获取 SiYuan 目录，失败！')
                sys.exit(1)
        else:
            targetDir = choose_target(res)
        _log(f'>>> 成功获取到目标目录: {targetDir}')
    # 检查目录是否存在
    if not os.path.exists(targetDir):
        _error(f'失败！插件目录不存在: "{targetDir}"')
        _error('请在 scripts/make_dev_link.py 中设置插件目录')
        sys.exit(1)

    # 获取插件名称
    name = get_plugin_name()
    _log(f'>>> 成功获取到插件名称: {name}')

    # 生成软连接
    make_link(targetDir, name)