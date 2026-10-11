const SECTIONS = [
    { weight: 5, check: (p) => !!p.phone },
    { weight: 5, check: (p) => !!p.dateOfBirth },
    { weight: 5, check: (p) => !!p.gender },
    { weight: 3, check: (p) => !!p.category },
    { weight: 3, check: (p) => !!p.domicileState },
    { weight: 3, check: (p) => !!p.state },
    { weight: 3, check: (p) => !!p.city },
    { weight: 2, check: (p) => !!p.pincode },
    { weight: 5, check: (p) => p.annualFamilyIncome !== null && p.annualFamilyIncome !== undefined },
    { weight: 3, check: (p) => !!p.fatherName || !!p.motherName },
    { weight: 8, check: (p) => !!p.currentEducationLevel },
    { weight: 8, check: (p) => !!p.institutionName },
    { weight: 5, check: (p) => !!p.courseName },
    { weight: 5, check: (p) => !!p.branch },
    { weight: 3, check: (p) => p.currentSemester !== null && p.currentSemester !== undefined },
    { weight: 5, check: (p) => p.tenthPercentage !== null && p.tenthPercentage !== undefined },
    { weight: 5, check: (p) => p.twelfthPercentage !== null && p.twelfthPercentage !== undefined },
    { weight: 5, check: (p) => p.ugCGPA !== null && p.ugCGPA !== undefined },
    { weight: 4, check: (p) => p.skills.length > 0 },
    { weight: 3, check: (p) => p.achievements.length > 0 },
    { weight: 3, check: (p) => p.languages.length > 0 },
    { weight: 2, check: (p) => !!p.bio },
];
export function calculateCompletionScore(profile) {
    const totalWeight = SECTIONS.reduce((sum, s) => sum + s.weight, 0);
    const earned = SECTIONS.filter((s) => s.check(profile)).reduce((sum, s) => sum + s.weight, 0);
    return Math.round((earned / totalWeight) * 100);
}
export function getMissingFields(profile) {
    const missing = [];
    if (!profile.phone)
        missing.push('Phone number');
    if (!profile.dateOfBirth)
        missing.push('Date of birth');
    if (!profile.gender)
        missing.push('Gender');
    if (!profile.category)
        missing.push('Category (General/OBC/SC/ST)');
    if (!profile.domicileState)
        missing.push('Domicile state');
    if (profile.annualFamilyIncome === null || profile.annualFamilyIncome === undefined)
        missing.push('Annual family income');
    if (!profile.currentEducationLevel)
        missing.push('Current education level');
    if (!profile.institutionName)
        missing.push('Institution name');
    if (!profile.courseName)
        missing.push('Course name');
    if (profile.tenthPercentage === null || profile.tenthPercentage === undefined)
        missing.push('Class 10 percentage');
    if (profile.twelfthPercentage === null || profile.twelfthPercentage === undefined)
        missing.push('Class 12 percentage');
    return missing;
}
//# sourceMappingURL=profileScore.js.map