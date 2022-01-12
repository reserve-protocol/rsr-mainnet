import fs from 'fs'

export interface IDeployments {
  oldRSR: string
  rsr: string
  forkSpell: string
  siphonSpell: string
  slowWallet: string
}

const tempFileSuffix: string = '-tmp-deployments.json'

export const getDeploymentFilename = (chainId: number): string => {
  return `./${chainId}${tempFileSuffix}`
}

export const fileExists = (file: string): boolean => {
  try {
    fs.accessSync(file, fs.constants.F_OK)
    return true
  } catch (e) {
    return false
  }
}

export const getDeploymentFile = (path: string): IDeployments => {
  if (!fileExists(path)) {
    throw new Error(`Deployment file ${path} does not exist. Maybe contracts weren't deployed?`)
  }
  try {
    return JSON.parse(fs.readFileSync(path, 'utf8'))
  } catch (e) {
    throw new Error(`Failed to read ${path}. Maybe the file is badly generated?`)
  }
}
