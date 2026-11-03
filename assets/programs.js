/* General adult wellness guidance; not a clinical nutrition prescription. */
function bodyProgram(goal) {
  if (goal === 'Thin') return {
    title: 'STEADY WEIGHT LOSS',
    text: 'Build regular, satisfying meals and a gradual routine. Body size labels alone do not establish whether weight loss is appropriate.',
    rule: 'Include protein, vegetables or fruit, fiber-rich carbohydrates, and some unsaturated fat. Adjust portions gradually; do not skip meals to compensate.',
    movement: 'Build toward 150 minutes of moderate activity per week and strength work on at least 2 days, at a pace you can manage.',
    recovery: 'Aim for 7–9 hours of sleep and review energy, hunger, and your longer-term trend. A short deadline is not a reason to restrict harder.'
  };
  if (goal === 'Built') return {
    title: 'MUSCLE + STRENGTH',
    text: 'Support progressive strength training with regular meals and enough food to recover. More food alone does not build muscle.',
    rule: 'Include a protein source at each meal, carbohydrates to fuel training, vegetables or fruit, and unsaturated fats. Add food if training and recovery require it.',
    movement: 'Train major muscle groups on at least 2 days per week. Increase difficulty gradually and allow recovery between hard sessions.',
    recovery: 'Aim for 7–9 hours of sleep. Track strength and recovery as well as body changes; avoid promising a muscle-gain finish date.'
  };
  return {
    title: 'BODY MAINTENANCE',
    text: 'Keep weight broadly stable while supporting daily energy, strength, and routines you can repeat.',
    rule: 'Eat regular balanced meals with protein, vegetables or fruit, fiber-rich carbohydrates, and unsaturated fats. Adjust portions to hunger, activity, and your longer-term trend.',
    movement: 'Build toward 150 minutes of moderate activity per week and strength work on at least 2 days. Start smaller when needed.',
    recovery: 'Aim for 7–9 hours of sleep. Check energy, strength, and wellbeing alongside weight; maintenance does not require perfect days.'
  };
}
function programMeal(meal, goal) {
  const result = JSON.parse(JSON.stringify(meal));
  result.subtitle = goal === 'Built' ? 'Fuel your training and recovery.' : goal === 'Thin' ? 'A satisfying meal. A gradual routine.' : 'Steady meals. Energy for your day.';
  result.items = result.items.map(item => item === 'Kitchen closed after this' ? 'If you are still hungry, a balanced snack is okay' : item);
  if (goal === 'Built' && result.id === 'midday') result.items[1] = 'Rice or sweet potato — enough to fuel your activity';
  if (goal === 'Thin' && result.id === 'midday') result.items[1] = 'Rice or sweet potato — a portion that leaves you satisfied';
  return result;
}
function publicShareUrl(value) {
  const url = new URL(value);
  const host = url.hostname.toLowerCase();
  if (url.protocol !== 'https:' || url.username || url.password || host === 'localhost' || host.endsWith('.localhost') || host.endsWith('.local') || host === '[::1]' || /^\d+\.\d+\.\d+\.\d+$/.test(host) || !host.includes('.')) throw new Error('Use the public HTTPS address where 2DAY is hosted.');
  url.search = ''; url.hash = '';
  return url.href;
}

function goalLabel(goal){return ({Thin:"Weight loss",Built:"Muscle gain",Maintain:"Maintenance",Fit:"Maintenance"})[goal] || "Maintenance";}
