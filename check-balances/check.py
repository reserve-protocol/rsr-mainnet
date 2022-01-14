"""check.py

Check that old RSR balances line up, as expected, with new RSR balances.
"""
import csv
from dataclasses import dataclass
from subprocess import run
import random
from sys import exit

OLD_RSR = "0x8762db106b2c2a0bccb3a80d1ed41273552616e8"
NEW_RSR = "0x320623b8e4ff03373931769a31fc52a4e78b5d70"


@dataclass
class Siphon:
    from_addr: str
    to_addr: str
    weight: float

    @staticmethod
    def read(line):
        [src, num, sink] = line.strip().split()
        return Siphon(src, sink, float(num))


def balance(rsr, addr):
    """Returns balance of addr on old RSR"""
    completed_process = run(
        ["seth", "call", rsr, "balanceOf(address)(uint)", addr], capture_output=True
    )
    return int(completed_process.stdout.strip())


def generate_random_addr():
    return "0x" + "".join([random.choice("1234567890abcdef") for _ in range(40)])


##### Grab data
# Read list of all addresses from Etherscan CSV export
all_holders = []
with open("oldrsr-holders.csv", newline="") as csv_file:
    csv_reader = csv.reader(csv_file)
    count = 10
    header = True
    all_holders = [addr for [addr, _, _] in csv_reader if addr != "HolderAddress"]

# Read list of siphon-enabled addresses from our siphon-spell deployer
siphon_list = []
with open("../scripts/deployment/siphon-list.txt") as siphon_file:
    siphon_list = [Siphon.read(line) for line in siphon_file]

siphon_srcs = set(s.from_addr for s in siphon_list)
siphon_dests = set(s.to_addr for s in siphon_list)
siphon_addrs = siphon_srcs.union(siphon_dests)

siphon_results = {}
with open("expected-siphon-results.txt") as results_file:
    for line in results_file:
        [addr, bal] = line.strip().split()
        siphon_results[addr] = float(bal)

# Unchanged addresses
normal_holders = [addr for addr in all_holders if addr not in siphon_addrs]

print(f"Addresses with unchanged balances: {len(normal_holders)}")
print(f"Old addresses with reduced balances: {len(siphon_srcs)}")
print(f"New addresses with increased balances: {len(siphon_dests)}")

##### Generate a little more data

# tests against a small number of addresses
# easy to remove this if you have really high-throughput access Ethereum node
normal_holders = [random.choice(normal_holders) for _ in range(50)]

# Invent a few random zero addresses for good measure
zero_addrs = [generate_random_addr() for _ in range(5)]

# print("Checking equality of some random holder balances", end="", flush=True)
# for addr in normal_holders:
#     print(".", end="", flush=True)
#     assert balance(OLD_RSR, addr) == balance(NEW_RSR, addr)
# print("")

# print("Checking some zero balances, for good measure", end="", flush=True)
# for addr in zero_addrs:
#     print(".", end="", flush=True)
#     assert balance(NEW_RSR, addr) == 0
# print("")

print("Checking zeroing of siphon sources", end="", flush=True)
for addr in siphon_srcs:
    print(".", end="", flush=True)
    assert balance(NEW_RSR, addr) == 0
print("")

# print("Checking expected resulting balances on siphoned addresses")
# for (addr, bal) in siphon_results.items():
#     print(".", end="", flush=True)
#     assert (
#         int(bal * 1e3 - 1) * int(1e15)
#         < balance(NEW_RSR, addr)
#         < int(bal * 1e3 + 1) * int(1e15)
#     )
# print("")

print("Computing change in sum of balances. plz wait kthx...")
old_balance = sum(balance(OLD_RSR, addr) for addr in siphon_srcs)
old_balance += balance(OLD_RSR, "0xA7b123D54BcEc14b4206dAb796982a6d5aaA6770")
print(f"Old balance from siphoned addresses: {old_balance}")
new_balance = sum(balance(NEW_RSR, addr) for addr in siphon_dests)
print(f"New balance in siphoned addresses: {new_balance}")
print(f"Difference: {old_balance - new_balance}")
