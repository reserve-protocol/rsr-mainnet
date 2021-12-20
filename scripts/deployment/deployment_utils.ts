import fs from 'fs'

export interface IDeployments {
    rsrPrev: string
    rsr: string
    upgradeSpell: string
    siphonSpell: string
  }
  
const tmp_file_suffix: string = '-tmp-deployments.json'

export const getDeploymentFilename = (chainId: number): string =>  {
    return `./${chainId}${tmp_file_suffix}`;
}

export const fileExists = async (file: string): Promise<boolean> => {
  return fs.promises
    .access(file, fs.constants.F_OK)
    .then(() => true)
    .catch(() => false);
}