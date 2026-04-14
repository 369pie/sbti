import fs from 'fs';

const target = '/Users/caonanya/AI_Code/repos/sbti/src/app/soulti/result/[type]/SoultiResultContent.tsx';
let content = fs.readFileSync(target, 'utf8');

content = content.replace('来觉察你的', '来探寻你的灵魂');
content = content.replace('的觉察者', '的同频灵魂');
content = content.replace('发给朋友一起觉察', '发给朋友一起共振');
content = content.replace('重新觉察', '重新探索');
content = content.replace('觉察不是为了改变你', '探索不是为了改变你');

fs.writeFileSync(target, content, 'utf8');

const target2 = '/Users/caonanya/AI_Code/repos/sbti/src/app/soulti/test/page.tsx';
let content2 = fs.readFileSync(target2, 'utf8');
content2 = content2.replace('开始觉察', '开启探索');
fs.writeFileSync(target2, content2, 'utf8');
