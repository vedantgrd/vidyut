export function computeMatchScore(scholarship, profile) {
    if (!profile)
        return 0;
    let score = 0;
    if (scholarship.educationLevels.length === 0 ||
        (profile.currentEducationLevel &&
            scholarship.educationLevels.includes(profile.currentEducationLevel)))
        score += 25;
    if (scholarship.categories.length === 0 ||
        (profile.category && scholarship.categories.includes(profile.category)))
        score += 20;
    const income = profile.annualFamilyIncome;
    const noIncomeReq = scholarship.maxIncome === null && scholarship.minIncome === null;
    const incomeOk = income !== null &&
        income !== undefined &&
        (scholarship.maxIncome === null || income <= scholarship.maxIncome) &&
        (scholarship.minIncome === null || income >= scholarship.minIncome);
    if (noIncomeReq || incomeOk)
        score += 15;
    if (scholarship.states.length === 0 ||
        (profile.domicileState && scholarship.states.includes(profile.domicileState)))
        score += 15;
    if (scholarship.genderEligibility === null ||
        (profile.gender && scholarship.genderEligibility === profile.gender))
        score += 10;
    if (profile.dateOfBirth) {
        const age = Math.floor((Date.now() - profile.dateOfBirth.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
        const ageOk = (scholarship.minAge === null || age >= scholarship.minAge) &&
            (scholarship.maxAge === null || age <= scholarship.maxAge);
        if (ageOk)
            score += 10;
    }
    else {
        if (scholarship.minAge === null && scholarship.maxAge === null)
            score += 10;
    }
    const cgpa = profile.ugCGPA;
    const pct = profile.twelfthPercentage;
    const academicOk = (scholarship.minCGPA === null || (cgpa !== null && cgpa !== undefined && cgpa >= scholarship.minCGPA)) &&
        (scholarship.minPercentage === null || (pct !== null && pct !== undefined && pct >= scholarship.minPercentage));
    if (academicOk)
        score += 5;
    return Math.min(100, score);
}
//# sourceMappingURL=matchScore.js.map