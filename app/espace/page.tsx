import Site from '../site';
import { requireChatGPTUser } from '../chatgpt-auth';
export const dynamic = 'force-dynamic';
export default async function Page() { const user = await requireChatGPTUser('/espace'); return <Site workspace user={{name:user.displayName,email:user.email}} />; }
