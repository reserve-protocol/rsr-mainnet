import fs from 'fs'

export interface IDeployments {
  oldRSR: string
  rsr: string
  forkSpell: string
  siphonSpell: string
}

const tempFileSuffix: string = '-tmp-deployments.json'

export const getDeploymentFilename = (chainId: number): string => {
  return `./${chainId}${tempFileSuffix}`
}

export const fileExists = (file: string): boolean => {
  let flag = true
  try {
    fs.accessSync(file, fs.constants.F_OK)
  } catch (e) {
    flag = false
  }

  return flag
}

export const getDeploymentFile = (path: string, chainId: string): IDeployments => {
  try {
    return JSON.parse(fs.readFileSync(path, 'utf8'))
  } catch (e) {
    throw new Error(
      `Deployment File does not exist for chain "${chainId}". Please make sure contracts are deployed and this file is properly generated.`
    )
  }
}
