const clientInfo = { // 模拟clientInfo
	appId: "xxx",
	uniPlatform: 'web',
	source: 'client', // 调用来源，不传时默认为 client
	clientIP: '127.0.0.1', // 客户端ip，不传时默认为 127.0.0.1
	uniIdToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiI2OGEzZTg1ZjU1YjMzNzg1NjE4ODExNjciLCJyb2xlIjpbXSwicGVybWlzc2lvbiI6W10sInVuaUlkVmVyc2lvbiI6IjEuMC4xOCIsImlhdCI6MTc1NTc0NzM4MSwiZXhwIjoxNzU2MDA2NTgxfQ.e4cTZQJ41Wvbfigq8O-esnbbWFZJpA31csv4EC-QuKs'
}
getSortMoney({
	firstDay: '2025-08-01',
	lastDay: '2025-08-31',
	pet_id: 0
})